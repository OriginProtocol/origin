const fs = require('fs')
const moment = require('moment')

const { Transfer, Sequelize } = require('../models')
const { executeTransfer } = require('../lib/transfer')
const logger = require('../logger')
const enums = require('../enums')

const LARGE_TRANSFER_THRESHOLD = 100000
const LARGE_TRANSFER_DELAY = 60

const initWatchdog = () => {
  // Check there is no existing watchdog.
  if (fs.existsSync(this.config.watchdog)) {
    throw new Error(
      `Watchdog detected at ${this.config.watchdog}. Processing aborted.`
    )
  }

  // Create a watchdog for this run.
  fs.writeFileSync(this.config.watchdog, `Pid ${process.pid}`)
}

const clearWatchdog = () => {
  // Clean watchdog.
  fs.unlinkSync(this.config.watchdog)
}

export const executeTransfers = async () => {
  initWatchdog()

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
      networkId: this.config.networkId
    })
    logger.info(
      `Processed transfer ${transfer.id}. Status: ${result.txStatus} TxHash: ${result.txHash}`
    )
  }

  clearWatchdog()
}
