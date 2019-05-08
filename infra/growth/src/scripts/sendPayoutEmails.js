// Tool for sending payout emails for all participant of a campaign
// once payout has been distributed.

'use strict'

const Logger = require('logplease')

const db = require('../models')
const enums = require('../enums')
const parseArgv = require('../util/args')
const { sendPayoutEmail } = require('../resources/email')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('sendPayoutEmails', { showTimestamp: false })

class SendPayoutEmails {
  constructor(config) {
    this.config = config
    this.stats = {
      numEmailsSent: 0
    }
  }

  /**
   * Sends a payout email to every account that got a payout.
   * @param campaignId
   * @returns {Promise<void>}
   */
  async process() {
    const campaignId = this.config.campaignId

    // Load the campaign and ensure it has the Distributed status.
    const campaign = await db.GrowthCampaign.findOne({
      where: {
        id: campaignId,
        status: enums.GrowthCampaignRewardStatuses.Distributed
      }
    })
    if (!campaign) {
      throw new Error(
        `No campaign with id ${campaignId} and status Distributed`
      )
    }

    // Load all the payout for that campaign.
    const payouts = await db.GrowthPayout.findAll({
      where: {
        campaignId,
        status: enums.GrowthPayoutdStatuses.Confirmed
      }
    })

    for (const payout of payouts) {
      if (this.config.doIt) {
        await sendPayoutEmail(payout.toAddress, payout.amount, payout.txnHash)
      } else {
        logger.info(
          `Would send email to account ${payout.toAddress}, amount ${
            payout.amount
          }, txnHash ${payout.txnHash}`
        )
      }
    }
  }
}

/**
 * MAIN
 */
logger.info('Starting payout emails job.')

const args = parseArgv()
const config = {
  // By default run in dry-run mode unless explicitly specified using persist.
  persist: args['--doIt'] ? args['--doIt'] : false,
  campaignId: args['--campaignId']
}
logger.info('Config:')
logger.info(config)

const job = new SendPayoutEmails(config)

job
  .process()
  .then(() => {
    logger.info('================================')
    logger.info('Job stats:')
    logger.info('  Number of emails sent:     ', job.stats.numEmailsSent)
    logger.info('Finished')
    process.exit()
  })
  .catch(err => {
    logger.error('Job failed: ', err)
    logger.error('Exiting')
    process.exit(-1)
  })
