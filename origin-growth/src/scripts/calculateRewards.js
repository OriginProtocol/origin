// Tool for calculating Growth Engine rewards earned y users. Steps are as follow:
//  - Look for a finished campaign for which calculation hasn't happened yet.
//  - Gather list of accounts that had events during the campaign window.
//  - For each account, calculate rewards and insert rows in growth_reward with status 'Pending'.
'use strict'

const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const Sequelize = require('sequelize')

const Token = require('origin-token/src/token')

const db = require('../models')
const enums = require('../enums')

const { Campaign } = require('../rules/rules')

// We allow a campaign to go a bit over budget since the capUsed field
// is not updated realtime but rather periodically via a cron job.
const CampaignMaxOverCapFactor = BigNumber(1.1)

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('calcRewards', { showTimestamp: false })

class CalculateRewards {
  constructor(token) {
    this.token = token
    this.stats = {
      numCampaigns: 0,
      calcGrandTotal: BigNumber(0)
    }
  }

  async _getParticipants(campaign) {
    // Get list of growth engine program participants that signed up
    // before campaign ended and that are in active status.
    const participants = await db.GrowthParticipant.findAll({
      where: {
        status: enums.GrowthParticipantStatus.Active,
        createdAt: { [Sequelize.Op.lt]: campaign.endDate }
      }
    })
    return participants
  }

  _matchBlackList(ethAddress) {
    // TODO(franck): IMPLEMENT ME
    //  - load user's profile
    //  - load SDN list
    //  - check user's lastname/firstname against list
    return false
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
    const txn = await Sequelize.transaction()
    try {
      for (const reward of rewards) {
        await db.GrowthReward.create({
          status: enums.GrowthRewardStatuses.Pending,
          ethAddress,
          campaignId: reward.campaignId,
          levelId: reward.levelId,
          ruleId: reward.ruleId,
          amount: reward.value,
          currency: reward.currency
        })
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
    const campaignRows = await db.findall({
      where: {
        endDate: { [Sequelize.Op.lt]: now },
        rewardStatus: enums.GrowthCampaignRewardStatuses.ReadyForCalculation
      }
    })

    for (const campaignRow of campaignRows) {
      const campaign = new Campaign(campaignRow, campaignRow.rules)
      logger.info(
        `Calculating rewards for campaign ${campaign.id} (${campaign.name})`
      )

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

      const campaignTotal = BigNumber(0)
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
        const rewards = await campaign.getRewards(ethAddress, true)

        // Insert rewards in the growth_reward table.
        const total = rewards
          .map(reward => reward.value)
          .reduce((v1, v2) => BigNumber(v1).plus(v2))
        await this._insertRewards(ethAddress, campaign, rewards)

        // Log and update stats.
        logger.info(`Participant ${ethAddress} - Calculation result:`)
        logger.info('  Num reward:      ', rewards.length)
        logger.info('  Total (natural): ', total)
        logger.info('  Total (token):   ', this.token.toTokenUnit(total))
        campaignTotal.plus(total)
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
      await campaignRow.update({
        rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
      })

      this.stats.calcGrandTotal.plus(campaignTotal)
    }
  }
}

/**
 * MAIN
 */
logger.info('Starting rewards calculation job.')
const token = new Token({})
const job = new CalculateRewards(token)
job.process().then(() => {
  logger.info('Rewards calculation job finished.')
  logger.info('  Number of campaigns processed:     ', job.stats.numCampaigns)
  logger.info('  Grand total distributed (natural): ', job.stats.calcGrandTotal)
  logger.info(
    '  Grand total distributed (tokens):  ',
    job.token.toTokenUnit(job.stats.calcGrandTotal)
  )
})
