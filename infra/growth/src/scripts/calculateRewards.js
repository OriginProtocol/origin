// Tool for calculating Growth Engine rewards earned by users. Steps are as follow:
//  - Look for a finished campaign for which calculation hasn't happened yet.
//  - Gather list of accounts that had events during the campaign window.
//  - For each account, calculate rewards and insert rows in growth_reward with status 'Pending'.
'use strict'

const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const Sequelize = require('sequelize')

const Token = require('@origin/token/src/token')

const enums = require('../enums')
const db = require('../models')
const { CampaignRules } = require('../resources/rules')
const parseArgv = require('../util/args')

// We allow a campaign to go a bit over budget since the capUsed field
// is not updated realtime but rather periodically via a cron job.
const CampaignMaxOverCapFactor = BigNumber(1.1)

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('calcRewards', { showTimestamp: false })

class CalculateRewards {
  constructor(config, token) {
    this.config = config
    this.token = token
    this.stats = {
      numCampaigns: 0,
      numAccountsPayout: 0,
      calcGrandTotal: BigNumber(0)
    }
  }

  /**
   *  Returns list of growth engine program participants that are potentially
   *  eligible for a payout during the campaign. Conditions:
   *  - signed up before campaign ended
   *  - in active status
   *  - not an employee
   *
   * @param {models.GrowthCampaign} campaign
   * @returns {Promise<Array<Object>>}
   * @private
   */
  async _getPayableParticipants(campaign) {
    const participants = await db.GrowthParticipant.findAll({
      where: {
        status: enums.GrowthParticipantStatuses.Active,
        createdAt: { [Sequelize.Op.lt]: campaign.endDate },
        employee: { [Sequelize.Op.ne]: true }
      }
    })
    return participants
  }

  async _checkForExistingReward(ethAddress, campaignId) {
    const rewards = await db.GrowthReward.findAll({
      where: {
        ethAddress,
        campaignId
      }
    })
    return rewards.length > 0
  }

  async _insertRewards(ethAddress, campaign, rewards) {
    const txn = await db.sequelize.transaction()
    try {
      for (const reward of rewards) {
        const data = {
          ethAddress,
          campaignId: reward.campaignId,
          levelId: reward.levelId,
          ruleId: reward.ruleId,
          amount: reward.value.amount,
          currency: reward.value.currency
        }
        if (this.config.persist) {
          await db.GrowthReward.create(data)
        } else {
          logger.info(`Would insert row in GrowthReward:`, data)
        }
      }
      await txn.commit()
    } catch (e) {
      await txn.rollback()
      throw e
    }
  }

  async process() {
    const now = new Date()

    let campaigns
    if (this.config.campaignId) {
      // A specific campaign ID was provided. Load it up.
      const campaign = await db.GrowthCampaign.findOne({
        where: {
          id: this.config.campaignId
        }
      })
      if (!campaign) {
        throw new Error(`Campaign ${campaign.id} does not exist`)
      }
      logger.debug('Loaded campaign', campaign.id, campaign.nameKey)
      campaigns = [campaign]
    } else {
      // No campaign ID provided.
      // Look for finished campaigns with rewards_status ready for calculation.
      campaigns = await db.GrowthCampaign.findAll({
        where: {
          endDate: { [Sequelize.Op.lt]: now },
          rewardStatus: enums.GrowthCampaignRewardStatuses.ReadyForCalculation
        }
      })
    }

    for (const campaign of campaigns) {
      logger.info(
        `Calculating rewards for campaign ${campaign.id} (${campaign.nameKey})`
      )
      const rules = new CampaignRules(campaign, JSON.parse(campaign.rules))

      // Consistency checks.
      if (campaign.currency !== 'OGN') {
        throw new Error(
          `Campaign ${campaign.id} - Currency ${campaign.currency} not supported.`
        )
      }
      if (campaign.endDate > now) {
        throw new Error(
          `Campaign ${campaign.id} - Does not end before ${campaign.endDate}`
        )
      }
      if (campaign.distributionDate > now) {
        throw new Error(
          `Campaign ${campaign.id} - Not ready for distribution before ${campaign.distributionDate}.`
        )
      }
      this.stats.numCampaigns++

      let campaignTotal = BigNumber(0)
      let participants
      if (this.config.ethAddress) {
        // A specific participant was provided. Load it up.
        const participant = await db.GrowthParticipant.findOne({
          where: {
            ethAddress: this.config.ethAddress.toLowerCase(),
            status: enums.GrowthParticipantStatuses.Active,
            createdAt: { [Sequelize.Op.lt]: campaign.endDate },
            employee: { [Sequelize.Op.ne]: true }
          }
        })
        if (!participant) {
          throw new Error(
            `Failed loading active and non employee participant ${this.config.ethAddress}`
          )
        }
        participants = [participant]
      } else {
        participants = await this._getPayableParticipants(campaign)
      }
      for (const participant of participants) {
        const ethAddress = participant.ethAddress
        logger.info(`Calculating reward for account ${ethAddress}`)

        // Check if any reward was already created for that user.
        // This could happen if this job got interrupted.
        if (await this._checkForExistingReward(ethAddress, campaign.id)) {
          logger.info(
            `Already calculated participant ${ethAddress} - Skipping.`
          )
          continue
        }

        // Calculate rewards for this user.
        // Note that we set the onlyVerifiedEvents param of getEarnedRewards to true.
        const rewards = await rules.getEarnedRewards(ethAddress, true)
        if (!rewards.length) {
          // User did not earn any reward.
          continue
        }

        // Insert rewards in the growth_reward table.
        await this._insertRewards(ethAddress, campaign, rewards)

        // Log and update stats.
        this.stats.numAccountsPayout++
        const total = rewards
          .map(reward => BigNumber(reward.value.amount))
          .reduce((v1, v2) => v1.plus(v2))
        logger.debug(`Participant ${ethAddress} - Calculation result:`)
        logger.debug('  Num reward:      ', rewards.length)
        logger.debug('  Total (natural): ', total.toFixed())
        logger.debug('  Total (token):   ', this.token.toTokenUnit(total))
        campaignTotal = campaignTotal.plus(total)
      }

      // Done calculating rewards for this campaign.
      logger.info(
        `Campaign calculation done. Total reward of ${campaignTotal.toFixed()}`
      )

      // Some sanity checks before we record the rewards.
      const maxCap = BigNumber(campaign.cap).times(CampaignMaxOverCapFactor)
      if (campaignTotal.gt(maxCap)) {
        throw new Error(
          `Campaign total rewards of ${campaignTotal} exceed max cap of ${maxCap}.`
        )
      }

      // Update the campaign's rewardStatus to 'Calculated'.
      // Except if this is a one-off calculation for a specific eth address
      // which is typically used post campaign payout for adjustment.
      if (!this.config.ethAddress) {
        if (this.config.persist) {
          await campaign.update({
            rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
          })
        } else {
          logger.info(
            `Would update campaign ${campaign.id} to status Calculated`
          )
        }
      }

      this.stats.calcGrandTotal = this.stats.calcGrandTotal.plus(campaignTotal)
    }
  }
}

/**
 * MAIN
 */
logger.info('Starting rewards calculation job.')

const args = parseArgv()
const config = {
  // By default run in dry-run mode unless explicitly specified using persist.
  persist: args['--persist'] === 'true' || false,
  campaignId: parseInt(args['--campaignId'] || 0),
  ethAddress: args['--ethAddress'] || null
}
logger.info('Config:')
logger.info(config)

const token = new Token(1, null)
const job = new CalculateRewards(config, token)

job
  .process()
  .then(() => {
    logger.info('================================')
    logger.info('Rewards calculation stats:')
    logger.info('  Number of campaigns processed:     ', job.stats.numCampaigns)
    logger.info(
      '  Grand total distributed (natural): ',
      job.stats.calcGrandTotal.toFixed()
    )
    logger.info(
      '  Grand total distributed (tokens):  ',
      job.token.toTokenUnit(job.stats.calcGrandTotal)
    )
    logger.info('Finished')
    process.exit()
  })
  .catch(err => {
    logger.error('Job failed: ', err)
    logger.error('Exiting')
    process.exit(-1)
  })
