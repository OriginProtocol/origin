const moment = require('moment')

const {
  largeTransferThreshold,
  largeTransferDelayMinutes
} = require('../config')
const { Transfer, TransferTask, Sequelize } = require('../models')
const { executeTransfer } = require('../lib/transfer')
const logger = require('../logger')
const enums = require('../enums')

const executeTransfers = async () => {
  logger.info('Running execute transfers job...')

  const outstandingTasks = await TransferTask.findAll({
    where: {
      end: null
    }
  })
  if (outstandingTasks.length > 0) {
    throw new Error(
      `Found incomplete transfer task(s), wait for completion or clean up manually.`
    )
  }

  const transferTask = await TransferTask.create({
    start: moment.utc()
  })

  const waitingTransfers = await Transfer.findAll({
    where: {
      [Sequelize.Op.or]: [
        {
          status: enums.TransferStatuses.WaitingConfirmation
        },
        {
          status: enums.TransferStatuses.Processing
        }
      ]
    }
  })
  if (waitingTransfers.length > 0) {
    throw new Error(
      `Found unconfirmed transfer(s). Fix before running this script again.`
    )
  }

  const cutoffTime = moment.utc().subtract(largeTransferDelayMinutes, 'minutes')
  const transfers = await Transfer.findAll({
    where: {
      [Sequelize.Op.or]: [
        {
          status: enums.TransferStatuses.Enqueued,
          amount: { [Sequelize.Op.gte]: largeTransferThreshold },
          createdAt: { [Sequelize.Op.lte]: cutoffTime }
        },
        {
          status: enums.TransferStatuses.Enqueued,
          amount: { [Sequelize.Op.lt]: largeTransferThreshold }
        }
      ]
    }
  })

  logger.info(`Processing ${transfers.length} transfers`)

  for (const transfer of transfers) {
    logger.info(`Processing transfer ${transfer.id}`)
    const result = await executeTransfer(transfer, transferTask.id)
    logger.info(
      `Processed transfer ${transfer.id}. Status: ${result.txStatus} TxHash: ${result.txHash}`
    )
  }

  await transferTask.update({
    end: moment.utc()
  })
}

module.exports = {
  executeTransfers
}
