const BigNumber = require('bignumber.js')

const Token = require('@origin/token/src/token')

const {
  GRANT_TRANSFER_DONE,
  GRANT_TRANSFER_FAILED
} = require('../constants/events')
const { Event, Grant, Transfer, sequelize } = require('../models')
const enums = require('../enums')
const logger = require('../logger')

const { vestedAmount } = require('./vesting')

// Number of block confirmations required for a transfer to be consider completed.
const NumBlockConfirmation = 8

// Wait up to 20 min for a transaction to get confirmed
const ConfirmationTimeoutSec = 20 * 60 * 60

/**
 * Helper method to check the validity of a transfer request.
 * Throws an exception in case the request sis invalid.
 * @param grantId
 * @param amount
 * @returns {Promise<Grant>}
 * @private
 */
async function _checkTransferRequest(grantId, amount) {
  // Load the grant and check there are enough tokens available to fullfill the transfer request.
  const grant = await Grant.findOne({
    where: {
      id: grantId
    },
    include: [{ model: Transfer }]
  })
  if (!grant) {
    throw new Error(`Could not find specified grant id ${grantId}`)
  }

  // Sum the amount from transfers that are in a pending or complete state
  const pendingOrCompleteTransfers = [
    enums.TransferStatuses.Enqueued,
    enums.TransferStatuses.Paused,
    enums.TransferStatuses.WaitingConfirmation,
    enums.TransferStatuses.Success
  ]

  const vested = vestedAmount(grant.get({ plain: true }))
  logger.info('Vested tokens', vested)

  const pendingOrCompleteAmount = grant.Transfers.reduce((total, transfer) => {
    if (pendingOrCompleteTransfers.includes(transfer.status)) {
      return (total += BigNumber(transfer.amount))
    }
    return total
  }, 0)
  logger.info('Pending or transferred tokens', pendingOrCompleteAmount)

  const available = vested - pendingOrCompleteAmount
  if (amount > available) {
    throw new RangeError(
      `Amount of ${amount} OGN exceeds the ${available} available for grant ${grantId}`
    )
  }

  return grant
}

/**
 * Enqueues a request to transfer tokens.
 * @param userId
 * @param grantId
 * @param address
 * @param amount
 * @returns {Promise<integer>} Id of the transfer request.
 */
async function enqueueTransfer(grantId, address, amount) {
  const grant = await _checkTransferRequest(grantId, amount)

  // Enqueue the request by inserting a row in the transfer table.
  // It will get picked up asynchronously by the offline job that processes transfers.
  // Record new state in the database.
  const transfer = await Transfer.create({
    grantId: grant.id,
    status: enums.TransferStatuses.Enqueued,
    toAddress: address.toLowerCase(),
    amount,
    currency: 'OGN' // For now we only support OGN.
  })
  logger.info(
    `Enqueued transfer. id: {transfer.id} address: ${address} amount: ${amount}`
  )
  return transfer
}

/**
 * Sends a blockchain transaction to transfer tokens and waits for the transaction to get confirmed.
 * @param {Transfer} transfer: DB model Transfer object
 * @param {{tokenMock:Object, networkId:number }} opts: options
 * @returns {Promise<{txHash: string, txStatus: string}>}
 */
async function executeTransfer(transfer, opts) {
  const { networkId, tokenMock } = opts

  const grant = await _checkTransferRequest(
    transfer.grantId,
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
      eventAction = GRANT_TRANSFER_DONE
      break
    case 'failed':
      transferStatus = enums.TransferStatuses.Failed
      eventAction = GRANT_TRANSFER_FAILED
      failureReason = 'Tx failed'
      break
    case 'timeout':
      transferStatus = enums.TransferStatuses.Failed
      eventAction = GRANT_TRANSFER_FAILED
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
    await transfer.update({ status: transferStatus })
    const event = {
      userId: grant.userId,
      grantId: grant.id,
      action: eventAction,
      data: JSON.stringify({
        transferId: transfer.id,
        amount: transfer.amount,
        from: supplier,
        to: transfer.toAddress,
        txHash
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

module.exports = { enqueueTransfer, executeTransfer }
