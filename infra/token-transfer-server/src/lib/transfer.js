const BigNumber = require('bignumber.js')
const get = require('lodash.get')
const jwt = require('jsonwebtoken')

const Token = require('@origin/token/src/token')

const { discordWebhookUrl } = require('../config')
const { sendEmail } = require('../lib/email')
const { postToWebhook } = require('./webhook')
const {
  TRANSFER_DONE,
  TRANSFER_FAILED,
  TRANSFER_REQUEST,
  TRANSFER_CONFIRMED
} = require('../constants/events')
const { Event, Transfer, User, sequelize } = require('../models')
const { hasBalance } = require('./balance')
const { transferConfirmationTimeout, transferHasExpired } = require('../shared')
const {
  clientUrl,
  encryptionSecret,
  gasPriceMultiplier,
  networkId
} = require('../config')
const enums = require('../enums')
const logger = require('../logger')

// Number of block confirmations required for a transfer to be consider completed.
const NumBlockConfirmation = 3

/**
 * Enqueues a request to transfer tokens.
 * @param userId
 * @param address
 * @param amount
 * @returns {Promise<Transfer>} Transfer object.
 */
async function addTransfer(userId, address, amount, data = {}) {
  const user = await hasBalance(userId, amount)

  // Enqueue the request by inserting a row in the transfer table.
  // It will get picked up asynchronously by the offline job that processes transfers.
  // Record new state in the database.
  let transfer
  const txn = await sequelize.transaction()
  try {
    transfer = await Transfer.create({
      userId: user.id,
      status: enums.TransferStatuses.WaitingEmailConfirm,
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
    `Transfer ${transfer.id} requested to ${address} by ${user.email} for ${amount}, pending email confirmation`
  )

  await sendTransferConfirmationEmail(transfer, user)

  return transfer
}

/**
 * Sends an email with a token that can be used for confirming a transfer.
 * @param transfer
 * @param user
 */
async function sendTransferConfirmationEmail(transfer, user) {
  const token = jwt.sign(
    {
      transferId: transfer.id
    },
    encryptionSecret,
    { expiresIn: `${transferConfirmationTimeout}m` }
  )

  const vars = { url: `${clientUrl}/withdrawal/${transfer.id}/${token}` }
  await sendEmail(user.email, 'transfer', vars)

  logger.info(
    `Sent email transfer confirmation token to ${user.email} for transfer ${transfer.id}`
  )
}

/* Moves a transfer from waiting for email confirmation to enqueued.
 * Throws an exception if the request is invalid.
 * @param transfer
 * @param user
 */
async function confirmTransfer(transfer, user) {
  if (transfer.status !== enums.TransferStatuses.WaitingEmailConfirm) {
    throw new Error('Transfer is not waiting for confirmation')
  }

  if (transferHasExpired(transfer)) {
    await transfer.update({
      status: enums.TransferStatuses.Expired
    })
    throw new Error('Transfer was not confirmed in the required time')
  }

  const txn = await sequelize.transaction()
  // Change state of transfer and add event
  try {
    await transfer.update({
      status: enums.TransferStatuses.Enqueued
    })
    const event = {
      userId: user.id,
      action: TRANSFER_CONFIRMED,
      data: JSON.stringify({
        transferId: transfer.id
      })
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

  try {
    if (discordWebhookUrl) {
      const countryDisplay = get(
        transfer.data.location,
        'countryName',
        'Unknown'
      )
      const webhookData = {
        embeds: [
          {
            title: `A transfer of \`${transfer.amount}\` OGN was queued by \`${user.email}\``,
            description: [
              `**ID:** \`${transfer.id}\``,
              `**Address:** \`${transfer.toAddress}\``,
              `**Country:** ${countryDisplay}`
            ].join('\n')
          }
        ]
      }
      await postToWebhook(discordWebhookUrl, JSON.stringify(webhookData))
    }
  } catch (e) {
    logger.error(
      `Failed sending Discord webhook for token transfer confirmation:`,
      e
    )
  }

  logger.info(
    `Transfer ${transfer.id} was confirmed by email token for ${user.email}`
  )

  return true
}

/**
 * Calculates gas price to use for sending transactions, by applying an
 * optional multiplier against the current median gas price
 * fetched from the network.
 *
 * @returns {Promise<{BigNumber}>} Gas price to use.
 */
async function _calcGasPrice() {
  // Get default gas price from web3 which is calculated as the
  // last few blocks median gas price.
  const medianGasPrice = await this.web3.eth.getGasPrice()

  if (gasPriceMultiplier) {
    const gasPrice = BigNumber(medianGasPrice).times(gasPriceMultiplier)
    return gasPrice.integerValue()
  }
  return BigNumber(medianGasPrice)
}

/**
 * Sends a blockchain transaction to transfer tokens.
 * @param {Transfer} transfer: Db model transfer object
 * @param {Integer} transferTaskId: Id of the calling transfer task
 * @returns {Promise<String>} Hash of the transaction
 */
async function executeTransfer(transfer, transferTaskId) {
  const user = await hasBalance(transfer.userId, transfer.amount)

  await transfer.update({
    status: enums.TransferStatuses.Processing,
    transferTaskId
  })

  // Setup token library
  const token = new Token(networkId)

  // Send transaction to transfer the tokens and record txHash in the DB.
  const naturalAmount = token.toNaturalUnit(transfer.amount)
  const supplier = await token.defaultAccount()

  const opts = {}
  if (process.env.NODE_ENV !== 'test') {
    opts.gasPrice = await _calcGasPrice()
  }

  let txHash
  try {
    txHash = await token.credit(transfer.toAddress, naturalAmount, opts)
  } catch (error) {
    logger.error('Error crediting tokens', error.message)

    await updateTransferStatus(
      user,
      transfer,
      enums.TransferStatuses.Failed,
      TRANSFER_FAILED,
      error.message
    )
    return false
  }

  logger.info(`Transfer ${transfer.id} processed with hash ${txHash}`)

  await transfer.update({
    status: enums.TransferStatuses.WaitingConfirmation,
    fromAddress: supplier.toLowerCase(),
    txHash
  })

  return txHash
}

/**
 * Sends a blockchain transaction to transfer tokens.
 * @param {Transfer} transfer: DB model Transfer object
 * @returns {Promise<String>}
 */
async function checkBlockConfirmation(transfer) {
  // Setup token library
  const token = new Token(networkId)

  // Wait for the transaction to get confirmed.
  const result = await token.txIsConfirmed(transfer.txHash, {
    numBlocks: NumBlockConfirmation
  })

  let transferStatus, eventAction, failureReason
  if (!result) {
    return null
  } else {
    switch (result.status) {
      case 'confirmed':
        transferStatus = enums.TransferStatuses.Success
        eventAction = TRANSFER_DONE
        break
      case 'failed':
        transferStatus = enums.TransferStatuses.Failed
        eventAction = TRANSFER_FAILED
        break
      default:
        throw new Error(
          `Unexpected status ${result.status} for txHash ${transfer.txHash}`
        )
    }
  }

  logger.info(
    `Received status ${result.status} for transaction ${transfer.txHash}`
  )

  const user = await User.findOne({
    where: {
      id: transfer.userId
    }
  })

  await updateTransferStatus(
    user,
    transfer,
    transferStatus,
    eventAction,
    failureReason
  )

  return result.status
}

/**
 * Update transfer status and add an event with the result of the transfer.
 * @param {User} transfer: Db model user object
 * @param {Transfer} transfer: Db model transfer object
 * @param {String} transferStatus
 * @param {String} eventAction:
 * @param {String} failureReason
 * @returns {Promise<undefined>}
 */
async function updateTransferStatus(
  user,
  transfer,
  transferStatus,
  eventAction,
  failureReason
) {
  // Update the status in the transfer table.
  const txn = await sequelize.transaction()
  try {
    await transfer.update({
      status: transferStatus
    })
    const event = {
      userId: user.id,
      action: eventAction,
      data: {
        transferId: transfer.id
      }
    }
    if (failureReason) {
      event.data.failureReason = failureReason
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
}

module.exports = {
  addTransfer,
  confirmTransfer,
  executeTransfer,
  checkBlockConfirmation
}
