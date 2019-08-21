const BigNumber = require('bignumber.js')
const moment = require('moment')

const Token = require('@origin/token/src/token')

const {
  TRANSFER_DONE,
  TRANSFER_FAILED,
  TRANSFER_REQUEST
} = require('../constants/events')
const { Event, Grant, Transfer, User, sequelize } = require('../models')
const enums = require('../enums')
const logger = require('../logger')

const { vestedAmount } = require('./vesting')

// Number of block confirmations required for a transfer to be consider completed.
const NumBlockConfirmation = 8

// Wait up to 20 min for a transaction to get confirmed
const ConfirmationTimeoutSec = 20 * 60 * 60
const TwofactorTimeoutMinutes = 5

/**
 * Helper method to check the validity of a transfer request.
 * Throws an exception in case the request is invalid.
 * @param userId
 * @param amount
 * @returns (Promise<User>)
 * @private
 */
async function checkTransferRequest(userId, amount) {
  const user = await User.findOne({
    where: {
      id: userId
    },
    include: [{ model: Grant }, { model: Transfer }]
  })
  // Load the user and check there enough tokens available to fulfill the
  // transfer request
  if (!user) {
    throw new Error(`Could not find specified user id ${userId}`)
  }

  // Sum the amount from transfers that are in a pending or complete state
  const pendingOrCompleteTransfers = [
    enums.TransferStatuses.WaitingTwoFactor,
    enums.TransferStatuses.Enqueued,
    enums.TransferStatuses.Paused,
    enums.TransferStatuses.WaitingConfirmation,
    enums.TransferStatuses.Success
  ]

  // Sum the vested tokens for all of the users grants
  const vested = user.Grants.map(grant => grant.get({ plain: true })).reduce(
    (total, grant) => {
      return total.plus(vestedAmount(grant))
    },
    BigNumber(0)
  )
  logger.info('Vested tokens', vested.toString())

  const pendingOrCompleteAmount = user.Transfers.reduce((total, transfer) => {
    if (pendingOrCompleteTransfers.includes(transfer.status)) {
      return total.plus(BigNumber(transfer.amount))
    }
    return total
  }, BigNumber(0))
  logger.info(
    'Pending or transferred tokens',
    pendingOrCompleteAmount.toString()
  )

  const available = vested.minus(pendingOrCompleteAmount)
  if (amount > available) {
    logger.info(
      `Amount of ${amount} OGN exceeds the ${available} available for user ${user.email}`
    )

    throw new RangeError(
      `Amount of ${amount} OGN exceeds the ${available} available balance`
    )
  }

  return user
}

/**
 * Enqueues a request to transfer tokens.
 * @param userId
 * @param address
 * @param amount
 * @returns {Promise<integer>} Id of the transfer request.
 */
async function addTransfer(userId, address, amount, data = {}) {
  const user = await checkTransferRequest(userId, amount)

  // Enqueue the request by inserting a row in the transfer table.
  // It will get picked up asynchronously by the offline job that processes transfers.
  // Record new state in the database.
  let transfer
  const txn = await sequelize.transaction()
  try {
    transfer = await Transfer.create({
      userId: user.id,
      status: enums.TransferStatuses.WaitingTwoFactor,
      toAddress: address.toLowerCase(),
      amount,
      currency: 'OGN', // For now we only support OGN.
      data
    })
    await Event.create({
      userId: user.id,
      action: TRANSFER_REQUEST,
      data: JSON.stringify({
        transferId: transfer.id
      })
    })
    await txn.commit()
  } catch (e) {
    await txn.rollback()
    logger.error(`Failed to add transfer for address ${address}: ${e}`)
    throw e
  }
  logger.info(
    `Added transfer. id: ${transfer.id} address: ${address} amount: ${amount}`
  )
  return transfer
}

/* Moves a transfer from waiting for two factor to enqueued.
 * Throws an exception if the request is invalid.
 * @param transfer
 */
async function confirmTransfer(transfer) {
  await checkTransferRequest(transfer.userId, transfer.amount, transfer)

  if (transfer.status !== enums.TransferStatuses.WaitingTwoFactor) {
    throw new Error('Transfer is not waiting for confirmation')
  }

  if (
    moment().diff(moment(transfer.createdAt), 'minutes') >
    TwofactorTimeoutMinutes
  ) {
    await transfer.update({
      status: enums.TransferStatuses.Expired
    })
    throw new Error('Transfer was not confirmed in the required time')
  }

  await transfer.update({
    status: enums.TransferStatuses.Enqueued
  })
}

/**
 * Sends a blockchain transaction to transfer tokens and waits for the transaction to get confirmed.
 * @param {Transfer} transfer: DB model Transfer object
 * @param {{tokenMock:Object, networkId:number }} opts: options
 * @returns {Promise<{txHash: string, txStatus: string}>}
 */
async function executeTransfer(transfer, opts) {
  const { networkId, tokenMock } = opts

  const user = await checkTransferRequest(
    transfer.userId,
    transfer.amount,
    transfer
  )

  // Setup token library. tokenMock is used for testing.
  const token = tokenMock || new Token(networkId)

  // Send transaction to transfer the tokens and record txHash in the DB.
  const naturalAmount = token.toNaturalUnit(transfer.amount)
  const supplier = await token.defaultAccount()
  const txHash = await token.credit(transfer.toAddress, naturalAmount)
  await transfer.update({
    status: enums.TransferStatuses.WaitingConfirmation,
    fromAddress: supplier.toLowerCase(),
    txHash
  })

  // Wait for the transaction to get confirmed.
  const { status } = await token.waitForTxConfirmation(txHash, {
    numBlocks: NumBlockConfirmation,
    timeoutSec: ConfirmationTimeoutSec
  })
  let transferStatus, eventAction, failureReason
  switch (status) {
    case 'confirmed':
      transferStatus = enums.TransferStatuses.Success
      eventAction = TRANSFER_DONE
      break
    case 'failed':
      transferStatus = enums.TransferStatuses.Failed
      eventAction = TRANSFER_FAILED
      failureReason = 'Tx failed'
      break
    case 'timeout':
      transferStatus = enums.TransferStatuses.Failed
      eventAction = TRANSFER_FAILED
      failureReason = 'Confirmation timeout'
      break
    default:
      throw new Error(`Unexpected status ${status} for txHash ${txHash}`)
  }
  logger.info(`Received status ${status} for txHash ${txHash}`)

  // Update the status in the transfer table.
  // Note: only create an event in case the transaction is successful. The event
  // table is used as an activity log presented to the user and we don't want
  // them to get alarmed if a transaction happened to fail. Our team will investigate,
  // fix the issue and resubmit the transaction if necessary.
  const txn = await sequelize.transaction()
  try {
    await transfer.update({
      status: transferStatus
    })
    const event = {
      userId: user.id,
      action: eventAction,
      data: JSON.stringify({
        transferId: transfer.id
      })
    }
    if (failureReason) {
      event.failureReason = failureReason
    }
    await Event.create(event)
    await txn.commit()
  } catch (e) {
    await txn.rollback()
    logger.error(
      `Failed writing confirmation data for transfer ${transfer.id}: ${e}`
    )
    throw e
  }

  return { txHash, txStatus: status }
}

module.exports = {
  addTransfer,
  checkTransferRequest,
  confirmTransfer,
  executeTransfer
}
