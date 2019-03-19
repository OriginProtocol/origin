// Tool for calculating Growth Engine rewards earned y users. Steps are as follow:
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
const { SdnMatcher } = require('../util/sdnMatcher')
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
      calcGrandTotal: BigNumber(0)
    }
    this.sdnMatcher = new SdnMatcher()
  }

  async _getParticipants(campaign) {
    // Get list of growth engine program participants that signed up
    // before campaign ended and that are in active status.
    const participants = await db.GrowthParticipant.findAll({
      where: {
        status: enums.GrowthParticipantStatuses.Active,
        createdAt: { [Sequelize.Op.lt]: campaign.endDate }
      }
    })
    return participants
  }

  /**
   * Returns true if the identity associated with the ethAddress tests positive
   * against the SDN blacklist.
   *
   * @param ethAddress
   * @returns {Promise<boolean>}
   * @private
   */
  async _matchBlackList(ethAddress) {
    const identity = db.Identity.findOne({ where: { ethAddress } })
    if (!identity) {
      return false
    }
    const match = this.sdnMatcher.match(identity.firstName, identity.lastName)
    if (match) {
      logger.info(
        `${ethAddress} checked positive against SDN blacklist for name ${
          identity.firstName
        } ${identity.lastName}.`
      )
    }
    return match
  }

  // TODO: Consider flagging the user in the identity table.
  async _banParticipant(participant, reason) {
    await participant.update({
      status: enums.GrowthParticipantStatus.Banned,
      data: Object.assign({}, participant.data, { banReason: reason })
    })
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
          status: enums.GrowthRewardStatuses.Pending,
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

    // Look for finished campaigns with rewards_status ready for calculation.
    const campaigns = await db.GrowthCampaign.findAll({
      where: {
        endDate: { [Sequelize.Op.lt]: now },
        rewardStatus: enums.GrowthCampaignRewardStatuses.ReadyForCalculation
      }
    })

    for (const campaign of campaigns) {
      logger.info(
        `Calculating rewards for campaign ${campaign.id} (${campaign.name})`
      )
      const rules = new CampaignRules(campaign, JSON.parse(campaign.rules))

      // Consistency checks.
      if (campaign.currency !== 'OGN') {
        throw new Error(
          `Campaign ${campaign.id} - Currency ${
            campaign.currency
          } not supported.`
        )
      }
      if (campaign.endDate > now) {
        throw new Error(
          `Campaign ${campaign.id} - Does not end before ${campaign.endDate}`
        )
      }
      if (campaign.distributionDate > now) {
        throw new Error(
          `Campaign ${campaign.id} - Not ready for distribution before ${
            campaign.distributionDate
          }.`
        )
      }

      let campaignTotal = BigNumber(0)
      const participants = await this._getParticipants(campaign)
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

        // Check the user's name against the black list.
        if (this._matchBlackList(ethAddress)) {
          await this._banParticipant(ethAddress, 'Blacklist match')
          logger.info(`Banned participant ${ethAddress} - Skipping.`)
          continue
        }

        // Calculate rewards for this user.
        // Note that we set the onlyVerifiedEvents param of getRewards to true.
        const rewards = await rules.getRewards(ethAddress, true)
        if (!rewards.length) {
          continue
        }

        // Insert rewards in the growth_reward table.
        const total = rewards
          .map(reward => reward.value.amount)
          .reduce((v1, v2) => BigNumber(v1).plus(v2))
        await this._insertRewards(ethAddress, campaign, rewards)

        // Log and update stats.
        logger.info(`Participant ${ethAddress} - Calculation result:`)
        logger.info('  Num reward:      ', rewards.length)
        logger.info('  Total (natural): ', total.toFixed())
        logger.info('  Total (token):   ', this.token.toTokenUnit(total))
        campaignTotal = campaignTotal.plus(total)
      }

      // Done calculating rewards for this campaign.
      logger.info(`Campaign calculation done. Total reward of ${campaignTotal}`)

      // Some sanity checks before we record the rewards.
      const maxCap = BigNumber(campaign.cap).times(CampaignMaxOverCapFactor)
      if (campaignTotal.gt(maxCap)) {
        throw new Error(
          `Campaign total rewards of ${campaignTotal} exceed max cap of ${maxCap}.`
        )
      }

      // Update the campaign's rewardStatus to 'Calculated'.
      if (this.config.persist) {
        await campaign.update({
          rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
        })
      } else {
        logger.info(`Would update campaign ${campaign.id} to status Calculated`)
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
  persist: args['--persist'] ? args['--persist'] : false
}
logger.info('Config:')
logger.info(config)

const token = new Token({})
const job = new CalculateRewards(config, token)

job
  .process()
  .then(() => {
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
