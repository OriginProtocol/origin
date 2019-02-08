// Tool for calculating Growth Engine rewards earned y users. Steps are as follow:
//  - Look for a finished campaign for which calculation hasn't happened yet.
//  - Gather list of accounts that had events during the campaign window.
//  - For each account, calculate rewards and insert rows in growth_reward with status 'Pending'.
'use strict'

const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const Sequelize = require('sequelize')

const db = require('../models')
const enums = require('../enums')

const { Campaign } = require('../rules/rules')

// We allow a campaign to got a bit over cap since the cap used is not updated realtime but
// rather periodically via a cron job.
const CampaignMaxOverCapFactor = BigNumber(1.1)

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('calcRewards', { showTimestamp: false })

async function _getParticipants(campaign) {
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

function _matchBlackList(ethAddress) {
  // TODO(franck):
  //  - load user's profile
  //  - load SDN list
  //  - check user's lastname/firstname against list
  return false
}

// TODO: should we also flag the user in the identity table ?
async function _banParticipant(participant, reason) {
  await participant.update({
    status: enums.GrowthParticipantStatus.Banned,
    data: Object.assign({}, participant.data, { banReason: 'Black list match' })
  })
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
    await txn.commit()
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
    let campaignTotal = BigNumber(0)

    const participants = await _getParticipants(campaign)
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

      // Check the user's name against the black list.
      if (_matchBlackList(participant.ethAddress)) {
        await _banParticipant(ethAddress)
        logger.info(`Banned participant ${participant.ethAddress} - Skipping.`)
        continue
      }

      // Calculate rewards for this user.
      const rewards = await campaign.getRewards(participant.ethAddress)

      // Insert rewards in the growth_reward table.
      // FIXME: use BN
      const total = rewards
        .map(reward => reward.value)
        .reduce((v1, v2) => BigNumber(v1).plus(v2))
      logger.info(
        `Recording ${rewards.length} awards for a total of ${total} ${
          campaign.currency
        }`
      )
      await _insertRewards(participant.ethAddress, campaign, rewards)
      campaignTotal.plus(total)
    }

    // Done calculating rewards for this campaign.
    logger.info(
      `Campaign calculation done. Total reward of ${campaignTotal} ${
        campaign.currency
      }`
    )

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
  }
}

logger.info('Starting rewards calculation job.')
main().then(logger.info('Finished.'))
