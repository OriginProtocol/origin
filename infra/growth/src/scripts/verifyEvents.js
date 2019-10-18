// Scans growth events and runs heuristics to detect fraudulent activity.
// Mark growth_event rows as either 'Verified' or 'Fraud'.

'use strict'

const Sequelize = require('sequelize')
const Logger = require('logplease')

const enums = require('../enums')
const _discoveryModels = require('@origin/discovery/src/models')
const _identityModels = require('@origin/identity/src/models')
const _growthModels = require('../models')
const db = { ..._discoveryModels, ..._identityModels, ..._growthModels }

const parseArgv = require('../util/args')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('verifyEvents', { showTimestamp: false })

let FraudEngine
if (process.env.NODE_ENV === 'production' || process.env.USE_PROD_FRAUD) {
  FraudEngine = require('../fraud/prod/engine')
  logger.info('Loaded PROD fraud engine.')
} else {
  FraudEngine = require('../fraud/dev/engine')
  logger.info('Loaded DEV fraud engine.')
}

class VerifyEvents {
  constructor(config) {
    this.config = config
    this.stats = {
      numSkipped: 0,
      numProcessed: 0,
      numVerified: 0,
      numFraud: 0
    }
    this.fraudEngine = new FraudEngine()
  }

  /**
   * Resolves the address of the wallet that owns the address (aka owner).
   *
   * @param {string} address
   * @returns {Promise<string>}
   * @private
   */
  async _getOwnerAddress(address) {
    // Check if it is a proxy address
    const row = await db.Proxy.findOne({ where: { address } })
    if (row) {
      // It is a proxy address, return the owner's address.
      return row.ownerAddress
    }
    // It is not a proxy address therefore it must be a wallet address.
    return address
  }

  async process() {
    // Load the campaign.
    if (!this.config.campaignId) {
      throw new Error('A campaign id must be supplied')
    }
    const campaign = await db.GrowthCampaign.findOne({
      where: { id: this.config.campaignId }
    })
    if (!campaign) {
      throw new Error(
        `Failed loading campaign with id ${this.config.campaignId}`
      )
    }

    // Initialize the fraud engine.
    await this.fraudEngine.init()

    // Load all events that were created prior to the campaign end and
    // and that are still in Logged state.
    const events = await db.GrowthEvent.findAll({
      where: {
        status: enums.GrowthEventStatuses.Logged,
        createdAt: { [Sequelize.Op.lt]: campaign.endDate }
      }
    })
    logger.info(
      `Loaded ${events.length} events with status Logged and creation time prior to ${campaign.endDate}`
    )

    // Walk thru each event and update their status based
    // on fraud engine output.
    logger.info('Verifying events... This may take some time.')
    for (const event of events) {
      const ownerAddress = await this._getOwnerAddress(event.ethAddress)
      // Check if event was logged for a user enrolled in Origin Reward.
      // TODO: would be more efficient to load all participants upfront.
      const participant = await db.GrowthParticipant.findOne({
        where: { ethAddress: ownerAddress }
      })
      if (!participant) {
        // This is normal since the listener logs events for all users and
        // not only users enrolled in Origin Rewards.
        // Leave the event as Logged, it may get verified in the future
        // if the user enrolls in Origin Rewards.
        this.stats.numSkipped++
        continue
      }

      let status, data
      const fraud = await this.fraudEngine.isFraudEvent(participant, event)
      if (fraud) {
        status = enums.GrowthEventStatuses.Fraud
        data = Object.assign(event.data || {}, { fraud })
        this.stats.numFraud++
      } else {
        status = enums.GrowthEventStatuses.Verified
        data = event.data // No change to data.
        this.stats.numVerified++
      }
      if (this.config.persist) {
        await event.update({ status, data })
      } else {
        logger.info(
          `Would mark event ${event.id} as ${status} with data ${JSON.stringify(
            data
          )}`
        )
      }
      this.stats.numProcessed++
    }
  }
}

module.exports = VerifyEvents

/**
 * MAIN
 */
if (require.main === module) {
  logger.info('Starting events verification job.')

  const args = parseArgv()
  const config = {
    // By default run in dry-run mode unless explicitly specified using persist.
    persist: args['--persist'] === 'true' || false,
    // Campaign for which events should be verified
    campaignId: args['--campaignId']
  }
  logger.info('Config:')
  logger.info(config)

  const job = new VerifyEvents(config)

  job
    .process()
    .then(() => {
      logger.info('================================')
      logger.info('Events verification stats:')
      logger.info(
        '  Number of events skipped:            ',
        job.stats.numSkipped
      )
      logger.info(
        '  Number of events processed:          ',
        job.stats.numProcessed
      )
      logger.info(
        '  Number of events marked as verified :',
        job.stats.numVerified
      )
      logger.info('  Number of events marked as fraud    :', job.stats.numFraud)
      logger.info('Finished')
      process.exit()
    })
    .catch(err => {
      logger.error('Job failed: ', err)
      logger.error('Exiting')
      process.exit(-1)
    })
}
