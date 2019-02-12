// Runs periodically and scans active campaigns to update:
//  - capUsed: budget used so far.
//  - rewardStatus: set to ReadyForCalculation once campaign is over and
//    all events during the campaign time window have been verified.

'use strict'

const Logger = require('logplease')
const Sequelize = require('sequelize')

const enums = require('../enums')
const db = require('../models')
const parseArgv = require('../util/args')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('verifyEvents', { showTimestamp: false })

class UpdateCampaigns {
  constructor(config) {
    this.config = config
    this.stats = {
      numProcessed: 0,
      numStatusReady: 0,
      numUsedCapUpdated: 0
    }
  }

  // TODO(franck): IMPLEMENT ME
  async _updateCapUsed(campaign) {
    logger.debug(`Checking capUsed for campaign ${campaign.id}`)
    return 0
  }

  async _allEventsVerified(cutoffDate) {
    const events = await db.GrowthEvent.findAll({
      where: {
        status: enums.GrowthEventStatuses.Logged,
        createdAt: { [Sequelize.Op.lt]: cutoffDate }
      }
    })
    return events.length === 0
  }

  async process() {
    const now = new Date()

    // Look for campaigns that have started with status NotReady.
    const campaigns = await db.GrowthCampaign.findAll({
      where: {
        rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady,
        startDate: { [Sequelize.Op.lt]: now }
      }
    })

    for (const campaign of campaigns) {
      // Update cap used.
      await this._updateCapUsed(campaign)

      // Determine if campaign's status should be set to ReadyForCalculation.
      // Conditions:
      //  a) Campaign over
      //  b) All events for the campaign's period have been verified.
      const readyForCalculation =
        campaign.endDate < now &&
        (await this._allEventsVerified(campaign.endDate))
      if (readyForCalculation) {
        if (this.config.persist) {
          await campaign.update({
            rewardStatus: enums.GrowthCampaignRewardStatuses.ReadyForCalculation
          })
        } else {
          logger.info(
            `Would mark campaign ${campaign.id} as ReadyForCalculation`
          )
        }
        this.stats.numStatusReady++
      }
      this.stats.numProcessed++
    }
  }
}

/**
 * MAIN
 */
logger.info('Starting campaigns update job.')

const args = parseArgv()
const config = {
  // By default run in dry-run mode unless explicitly specified using persist.
  persist: args['--persist'] ? args['--persist'] : false
}
logger.info('Config:')
logger.info(config)

const job = new UpdateCampaigns(config)

job.process()
  .then(() => {
    logger.info('Campaigns update stats:')
    logger.info('  Num processed:            ', job.stats.numProcessed)
    logger.info('  Num marked as calc. ready:', job.stats.numStatusReady)
    logger.info('  Num usedCap updated:      ', job.stats.numUsedCapUpdated)
    logger.info('Finished')
    process.exit()
  })
  .catch(err => {
    logger.error('Job failed: ', err)
    logger.error('Exiting')
    process.exit(-1)
  })
