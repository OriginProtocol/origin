// Scans growth events and runs heuristics to detect fraudulent activity.
// Mark growth_event rows as either 'Verified' or 'Fraud'.

'use strict'

const Logger = require('logplease')
const Sequelize = require('sequelize')

const enums = require('../enums')
const db = require('../models')
const parseArgv = require('../util/args')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('verifyEvents', { showTimestamp: false })

class VerifyEvents {
  constructor(config) {
    this.config = config
    this.stats = {
      numProcessed: 0,
      numVerified: 0,
      numFraud: 0
    }
  }

  // TODO(franck): IMPLEMENT ME
  _isFraud(event) {
    return false
  }

  async process() {
    const now = new Date()

    // Look for events with status 'Logged'
    const events = await db.GrowthEvent.findAll({
      where: {
        status: enums.GrowthEventStatuses.Logged,
        createdAt: { [Sequelize.Op.lt]: now }
      }
    })

    for (const event of events) {
      let status
      if (this._isFraud(event)) {
        status = enums.GrowthEventStatuses.Fraud
        this.stats.numFraud++
      } else {
        status = enums.GrowthEventStatuses.Verified
        this.stats.numVerified++
      }
      if (this.config.doIt) {
        await event.update({ status })
      } else {
        logger.info(`Would mark event ${event.id} as ${status}`)
      }
      this.stats.numProcessed++
    }
  }
}

/**
 * MAIN
 */
logger.info('Starting events verification job.')

const args = parseArgv()
const config = {
  // By default run in dry-run mode unless explicitly specified using doIt.
  doIt: args['--doIt'] ? args['--doIt'] : false
}
logger.info('Config:')
logger.info(config)

const job = new VerifyEvents(config)

job.process().then(() => {
  logger.info('Events verification stats:')
  logger.info('  Number of events processed:          ', job.stats.numProcessed)
  logger.info('  Number of events marked as verified :', job.stats.numVerified)
  logger.info('  Number of events marked as fraud    :', job.stats.numFraud)
  logger.info('Finished')
  process.exit()
})
