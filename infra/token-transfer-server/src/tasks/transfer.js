const moment = require('moment')
const Sequelize = require('sequelize')

const {
  largeTransferThreshold,
  largeTransferDelayMinutes
} = require('../config')
const { Transfer, TransferTask, sequelize } = require('../models')
const { checkBlockConfirmation, executeTransfer } = require('../lib/transfer')
const logger = require('../logger')
const enums = require('../enums')

const executeTransfers = async token => {
  logger.info('Running execute transfers job...')

  const confirmingTransfers = await Transfer.findAll({
    where: {
      status: enums.TransferStatuses.WaitingConfirmation
    },
    order: [['updated_at', 'ASC']]
  })

  if (confirmingTransfers && confirmingTransfers.length > 0) {
    logger.info(
      `Found ${confirmingTransfers.length} transfer(s) waiting for block confirmation`
    )
    for (const transfer of confirmingTransfers) {
      const isConfirmed = await checkBlockConfirmation(transfer, token)
      if (!isConfirmed) {
        logger.info(
          `Transfer ${transfer.id} with hash ${transfer.txHash} not confirmed, exiting`
        )
        return
      }
    }
  }

  const transferTask = await sequelize.transaction(
    { isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async txn => {
      const outstandingTasks = await TransferTask.findAll(
        {
          where: {
            end: null
          }
        },
        { transaction: txn }
      )
      if (outstandingTasks.length > 0) {
        logger.warn(`Found incomplete transfer task(s), unable to proceed.`)
        return false
      }

      const processingTransfers = await Transfer.findAll(
        {
          where: {
            status: enums.TransferStatuses.Processing
          }
        },
        { transaction: txn }
      )
      if (processingTransfers.length > 0) {
        logger.warn(`Found processing transfers, unable to proceed`)
        return false
      }

      const now = moment.utc()
      return await TransferTask.create(
        {
          start: now,
          created_at: now,
          updated_at: now
        },
        { transaction: txn }
      )
    }
  )

  if (!transferTask) return

  const cutoffTime = moment.utc().subtract(largeTransferDelayMinutes, 'minutes')
  const transfer = await Transfer.findOne({
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
    },
    order: [['updated_at', 'ASC']]
  })

  if (transfer) {
    logger.info(`Processing transfer ${transfer.id}`)
    await executeTransfer(transfer, transferTask.id, token)
  }

  await transferTask.update({
    end: moment.utc()
  })
}

module.exports = {
  executeTransfers
}
