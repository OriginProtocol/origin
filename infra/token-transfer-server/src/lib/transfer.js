const Token = require('@origin/token/src/token')
const { createProvider } = require('@origin/token/src/config')

const {
  GRANT_TRANSFER_DONE,
  GRANT_TRANSFER_FAILED,
  GRANT_TRANSFER_REQUEST
} = require('../constants/events')
const { Event, Grant, Transfer, User, Sequelize } = require('../models')
const enums = require('../enums')
const logger = require('../logger')

// Number of block confirmations required for a transfer to be consider completed.
const NumBlockConfirmation = 8

// Wait up to 20min for a transaction to get confirmed
const ConfirmationTimeout = 1200

/**
 * Helper method to check the validity of a transfer request.
 * Throws an exception in case the request sis invalid.
 * @param userId
 * @param grantId
 * @param amount
 * @param {Transfer} transfer: Optional. The pending transfer to check for.
 * @returns {Promise<void>}
 * @private
 */
async function _checkTransferRequest(userId, grantId, amount, transfer = null) {
  // Check the user exists.
  const user = await User.findOne({
    where: { id: userId }
  })
  if (!user) {
    throw new ReferenceError(`No user found iwth id ${userId}`)
  }

  // Load the grant and check there are enough tokens available to fullfill the transfer request.
  const grant = await Grant.findOne({
    where: {
      id: grantId,
      userId
    }
  })
  if (!grant) {
    throw new ReferenceError(
      `Could not find specified grant id ${grantId} for user ${user.email}`
    )
  }

  // TODO(franck/tom): Replace with a call to the logic for calculating tokens available.
  //   Note: If transfer arg is not null, make sure to not double count that amount.
  const placeholderAvailable = () => {
    return grant.amount
  }
  const available = placeholderAvailable(userId, grantId, transfer)
  if (amount > available) {
    throw new RangeError(
      `Amount of ${amount} OGN exceeds the ${available} available for grant ${grantId}`
    )
  }
}

/**
 * Enqueues a request to transfer tokens.
 * @param userId
 * @param grantId
 * @param networkId
 * @param address
 * @param amount
 * @returns {Promise<integer>} Id of the transfer request.
 */
async function enqueueTransfer(
  userId,
  grantId,
  networkId,
  address,
  amount,
  ip
) {
  _checkTransferRequest(userId, grantId, amount)

  // Enqueue the request by inserting a row in the transfer table.
  // It will get picked up asynchronously by the offline job that processes transfers.
  // Record new state in the database.
  let transfer
  const txn = await Sequelize.transaction()
  try {
    transfer = await Transfer.create({
      grantId,
      status: enums.TransferStatuses.Enqueued,
      toAddress: address.toLowerCase(),
      amount,
      currency: 'OGN' // For now we only support OGN.
    })
    await Event.create({
      userId,
      grantId,
      action: GRANT_TRANSFER_REQUEST,
      data: JSON.stringify({
        transferId: transfer.id,
        amount: transfer.amount,
        to: transfer.toAddress
      }),
      ip
    })
    await txn.commit()
  } catch (e) {
    await txn.rollback()
    logger.error(`Failed to enqueue transfer for address ${address}: ${e}`)
    throw e
  }
  logger.info(
    `Enqueued transfer. id: {transfer.id} address: ${address} amount: ${amount}`
  )
  return transfer.id
}

/**
 * Sends a blockchain transaction to transfer tokens and waits for the transaction to get confirmed.
 * @param {models.Transfer} transfer: DB model Transfer object
 * @param {{tokenForTests:Object, networkId:number }} opts: options
 * @returns {Promise<{txHash: string, txStatus: string}>}
 */
async function executeTransfer(transfer, opts) {
  const { tokenForTests, networkId } = opts

  _checkTransferRequest(
    transfer.userId,
    transfer.grantId,
    transfer.amount,
    transfer
  )

  // Setup token library
  const token = tokenForTests || new Token(networkId, createProvider(networkId))

  // Send transaction to transfer the tokens and record txHash in the DB.
  const naturalAmount = token.toNaturalUnit(transfer.amount)
  const supplier = await token.defaultAccount()
  const txHash = token.sendTx(transfer.toAddress, naturalAmount)
  await transfer.update({
    status: enums.TransferStatuses.WaitingConfirmation,
    fromAddress: supplier.toLowerCase(),
    txHash
  })

  // Wait for the transaction to get confirmed.
  const { txStatus } = await token.waitForTxConfirmation(txHash, {
    numBlocks: NumBlockConfirmation,
    timeoutSec: ConfirmationTimeout
  })
  let transferStatus, eventAction, failureReason
  switch (txStatus) {
    case 'confirmed':
      transferStatus = GRANT_TRANSFER_DONE
      eventAction = GRANT_TRANSFER_DONE
      break
    case 'failed':
      transferStatus = GRANT_TRANSFER_FAILED
      failureReason = 'Tx failed'
      break
    case 'timeout':
      transferStatus = GRANT_TRANSFER_FAILED
      failureReason = 'Confirmation timeout'
      break
    default:
      throw new Error(`Unexpected tx status ${txStatus} for txHash ${txHash}`)
  }
  logger.info(`Received status ${txStatus} for txHash ${txHash}`)

  // Update the status in the transfer table.
  // Note: only create an event in case the transaction is successful. The event
  // table is used as an activity log presented to the user and we don't want
  // them to get alarmed if a transaction happened to fail. Our team will investigate,
  // fix the issue and resubmit the transaction if necessary.
  const txn = await Sequelize.transaction()
  try {
    await transfer.update({ status: transferStatus })
    const event = {
      userId: transfer.userId,
      grantId: transfer.grantId,
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
    await Event.create(event), await txn.commit()
  } catch (e) {
    await txn.rollback()
    logger.error(
      `Failed writing confirmation data for transfer ${transfer.id}: ${e}`
    )
    throw e
  }

  return { txHash, txStatus }
}

module.exports = { enqueueTransfer, executeTransfer }
