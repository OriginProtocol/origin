// Script to distribute Growth Engine rewards.
//  - Scans growth_reward table for rows with status Pending, grouped by account.
//  - For each row, distribute tokens to account

'use strict'

const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const Sequelize = require('sequelize')

const db = require('../models')
const enums = require('../enums')

const { Campaign } = require('../rules/rules')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('distRewards', { showTimestamp: false })

async function _distributeRewards(ethAddress, rewards) {
  // Sum up the reward amount.
  const total = rewards
    .map(reward => reward.amount)
    .reduce((a1, a2) => BigNumber(a1).plus(a2))
  logger.info(`Distributing reward of ${total} to ${ethAddress}`)

  // Mark the reward row(s) as InPayment.
  let txn = await Sequelize.transaction()
  try {
    rewards.forEach(reward => {
      reward.update({ status: enums.GrowthRewardStatuses.InPayment })
    })
    await txn.commit()
  } catch (e) {
    await txn.rollback()
    throw e
  }

  // Send the transaction.

  // Confirm the transaction.

  // Mark the rewards as Paid.
  txn = await Sequelize.transaction()
  try {
    rewards.forEach(reward => {
      reward.update({ status: enums.GrowthRewardStatuses.Paid })
    })
    await txn.commit()
  } catch (e) {
    await txn.rollback()
    throw e
  }
  return total
}

async function main() {
  const now = new Date().toISOString()

  // Look for campaigns with rewards_status Calculated and distribution date past now.
  const campaignRows = await db.findall({
    where: {
      distributionDate: { [Sequelize.Op.lt]: now },
      rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
    }
  })

  for (const campaignRow of campaignRows) {
    const campaign = new Campaign(campaignRow, campaignRow.rules)
    logger.info(
      `Calculating rewards for campaign ${campaign.id} (${campaign.name})`
    )
    let campaignDistTotal = 0

    // Load rewards rows for this campaign that are in status Pending.
    const rewardRows = await db.GrowthRewards.findAll({
      where: {
        campaignId: campaign.Id,
        status: enums.GrowthRewardStatuses.Pending
      }
    })

    // TODO: If this data set becomes too large to hold in memory,
    // handle the grouping in the SQL query above and process in chunks.
    const ethAddressToRewards = {}
    rewardRows.forEach(
      reward =>
        (ethAddressToRewards[reward.ethAddress] = ethAddressToRewards[
          reward.ethAddress
        ]
          ? ethAddressToRewards[reward.ethAddress].push(reward)
          : [])
    )

    // Distribute the rewards for each account.
    for (const [ethAddress, rewards] of Object.entries(ethAddressToRewards)) {
      const distAmount = await _distributeRewards(ethAddress, rewards)
      campaignDistTotal += distAmount
    }

    // Update the campaign reward status to indicate it was distributed.
    await campaignRow.update({
      rewardStatus: enums.GrowthCampaignRewardStatuses.Distributed
    })
    logger.info(
      `Finished distribution for campaign ${campaign.id} (${campaign.name}`
    )
    logger.info(`Distributed a total of ${campaignDistTotal}`)
    distGrandTotal += campaignDistTotal
  }
  return distGrandTotal
}

logger.info('Starting rewards distribution job.')
// TODO: use BN
let distGrandTotal = 0
main().then(() => {
  logger.info(`Distributed a grand total of ${distGrandTotal}`)
  logger.info('Job dinished.')
})
