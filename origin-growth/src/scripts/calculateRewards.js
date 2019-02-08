// Tool for calculating Growth Engine rewards earned y users. Steps are as follow:
//  - Look for a finished campaign for which calculation hasn't happened yet.
//  - Gather list of accounts that had events during the campaign window.
//  - For each account, calculate rewards and insert rows in growth_reward with status 'Pending'.
'use strict'

const Logger = require('logplease')
const Sequelize = require('sequelize')

const db = require('../models')
const enums = require('../enums')

const { Campaign } = require('../rules/rules')

// We allow a campaign to got a bit over cap since the cap used is not updated realtime but
// rather periodically via a cron job.
const CampaignMaxOverCapFactor = 1.1

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('calcRewards', { showTimestamp: false })

async function _getParticipatingAccounts(campaign) {
  // Get list of growth engine program participants that signed up
  // before campaign ended.
  const participants = await db.GrowthParticipant.findAll({
    where: {
      createdAt: { [Sequelize.Op.lt]: campaign.endDate }
    }
  })
  return participants
}

async function _checkForExistingReward(ethAddress, campaignId) {
  const rewards = await db.GrowthReward.findAll({
    where: {
      ethAddress,
      campaignId
    }
  })
  return rewards.length > 0
}

async function _insertRewards(ethAddress, campaign, rewards) {
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
  } catch (e) {
    await txn.rollback()
    throw e
  }
}

async function main() {
  const now = new Date().toISOString()

  // Look for finished campaigns with rewards_status undefined.
  const campaignRows = await db.findall({
    where: {
      endDate: { [Sequelize.Op.lt]: now },
      rewardStatus: enums.GrowthCampaignRewardStatuses.Undefined
    }
  })

  for (const campaignRow of campaignRows) {
    const campaign = new Campaign(campaignRow, campaignRow.rules)
    logger.info(
      `Calculating rewards for campaign ${campaign.id} (${campaign.name})`
    )
    let campaignTotal = 0

    const participants = await _getParticipatingAccounts(campaign)
    for (const participant of participants) {
      logger.info(`Calculating reward for account ${participant.ethAddress}`)

      // Check if any reward was already created for that user.
      // This could happen if this job got interrupted.
      if (await _checkForExistingReward(participant.ethAddress, campaign.id)) {
        logger.info(
          `Reward already calculated for account ${
            participant.ethAddress
          } - Skipping.`
        )
        continue
      }

      // Calculate rewards for this user.
      const rewards = await campaign.getRewards(participant.ethAddress)

      // Insert rewards in the growth_reward table.
      // TODO: use BN
      const total = rewards
        .map(reward => reward.value)
        .reduce((v1, v2) => v1 + v2)
      logger.info(
        `Recording ${rewards.length} awards for a total of ${total} ${
          campaign.currency
        }`
      )
      await _insertRewards(participant.ethAddress, campaign, rewards)
      campaignTotal += total
    }

    // Done calculating rewards for this campaign.
    logger.info(
      `Campaign calculation done. Total reward of ${campaignTotal} ${
        campaign.currency
      }`
    )

    // Some sanity checks before we record the rewards.
    if (campaignTotal > campaign.cap * CampaignMaxOverCapFactor) {
      throw new Error(`Campaign total rewards exceed cap.`)
    }

    // Update the campaign's rewardStatus to 'Calculated'.
    await campaignRow.update({
      rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
    })
  }
}

logger.info('Starting rewards calculation job.')
main().then(logger.info('Finished.'))
