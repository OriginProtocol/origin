// Tool for sending payout emails for all participant of a campaign
// once payout has been distributed.

'use strict'

const Logger = require('logplease')

const db = require('../models')
const enums = require('../enums')
const parseArgv = require('../util/args')
const { sendPayoutEmail } = require('../resources/email')
const { naturalUnitsToToken } = require('../../src/util/token')

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
        rewardStatus: enums.GrowthCampaignRewardStatuses.Distributed
      }
    })
    if (!campaign) {
      throw new Error(
        `No campaign with id ${campaignId} and status Distributed`
      )
    }

    // Load payout rows.
    const where = {
      campaignId,
      status: enums.GrowthPayoutStatuses.Confirmed
    }
    if (this.config.ethAddress) {
      // A specific eth address was specified.
      where.toAddress = this.config.ethAddress.toLowerCase()
    }
    if (this.config.minPayoutId) {
      where.id = { [db.Sequelize.Op.gte]: this.config.minPayoutId }
    }
    const payouts = await db.GrowthPayout.findAll({
      where,
      order: [['id', 'ASC']]
    })
    logger.info(`Sending payout email to ${payouts.length} lucky recipients`)

    for (const payout of payouts) {
      logger.info(`Sending email for payout id ${payout.id}`)
      if (payout.currency !== 'OGN') {
        throw new Error(`Unexpected currency ${payout.currency}`)
      }
      const amount = naturalUnitsToToken(payout.amount)
      if (this.config.doIt) {
        await sendPayoutEmail(payout.toAddress, amount, payout.txnHash)
      } else {
        logger.info(
          `Would send email to account ${payout.toAddress}, amount ${amount}, txnHash ${payout.txnHash}`
        )
      }
      this.stats.numEmailsSent++
    }
  }
}

/**
 * MAIN
 */
logger.info('Starting payout emails job.')

const args = parseArgv()
const config = {
  // By default run in dry-run mode unless explicitly specified.
  doIt: args['--doIt'] === 'true' || false,
  campaignId: args['--campaignId'],
  // Specific account to process.
  ethAddress: args['--ethAddress'] || null,
  // Min id in payout table to start at (inclusive).
  minPayoutId: args['--minPayoutId'] || null
}
logger.info('Config:')
logger.info(config)

if (!config.campaignId) {
  throw new Error('--campaignId arg missing')
}
if (
  config.doIt &&
  (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL)
) {
  throw new Error('Env vars SENDGRID_API_KEY and SENDGRID_FROM_EMAIL not set')
}

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
