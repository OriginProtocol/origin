const fs = require('fs')
const moment = require('moment')

const Token = require('@origin/token/src/token')

const { discordWebhookUrl } = require('../config')
const { postToWebhook } = require('../lib/webhook')
const { Transfer, Sequelize } = require('../models')
const { executeTransfer } = require('../lib/transfer')
const logger = require('../logger')
const enums = require('../enums')

const LARGE_TRANSFER_THRESHOLD = 100000
const LARGE_TRANSFER_DELAY = 60
const WATCHDOG_PATH = './.execution'
const NETWORK_ID = 1

const initWatchdog = () => {
  // Check there is no existing watchdog.
  if (fs.existsSync(WATCHDOG_PATH)) {
    throw new Error(
      `Watchdog detected at ${WATCHDOG_PATH}. Processing aborted.`
    )
  }

  // Create a watchdog for this run.
  fs.writeFileSync(WATCHDOG_PATH, `Pid ${process.pid}`)
}

const clearWatchdog = () => {
  // Clean watchdog.
  fs.unlinkSync(WATCHDOG_PATH)
}

export const executeTransfers = async () => {
  initWatchdog()

  const waitingTransfers = await Transfer.findAll({
    where: {
      status: enums.TransferStatuses.WaitingConfirmation
    }
  })
  if (waitingTransfers.length > 0) {
    throw new Error(
      `Found unconfirmed transfer(s). Fix before running this script again.`
    )
  }

  const cutoffTime = moment.utc().subtract(LARGE_TRANSFER_DELAY, 'hours')
  const transfers = await Transfer.findAll({
    where: {
      [Sequelize.op.or]: [
        {
          status: enums.TransferStatuses.Enqueued,
          amount: { [Sequelize.op.gte]: LARGE_TRANSFER_THRESHOLD },
          createdAt: { [Sequelize.Op.lt]: cutoffTime }
        },
        {
          status: enums.TransferStatuses.Enqueued,
          amount: { [Sequelize.op.lt]: LARGE_TRANSFER_THRESHOLD }
        }
      ]
    }
  })

  logger.info(`Processing ${transfers.length} transfers`)

  for (const transfer of transfers) {
    logger.info(`Processing transfer ${transfer.id}`)
    await transfer.update({ status: enums.TransferStatuses.Processing })
    const result = await executeTransfer(transfer, {
      networkId: NETWORK_ID
    })
    logger.info(
      `Processed transfer ${transfer.id}. Status: ${result.txStatus} TxHash: ${result.txHash}`
    )
  }

  clearWatchdog()
}

export const checkWalletBalance = async () => {
  const token = new Token(NETWORK_ID)
  const balance = token.toTokenUnit(token.balance())

  if (balance < 10) {
    const webhookData = {
      embeds: [
        {
          title: `Wallet balance is \`${balance}\`, should be \`${}\` OGN`
        }
      ]
    }
    await postToWebhook(discordWebhookUrl, JSON.stringify(webhookData))
  }
}
