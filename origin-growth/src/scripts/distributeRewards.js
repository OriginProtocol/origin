// Script to distribute Growth Engine rewards.
//  - Scans growth_reward table for rows with status Pending, grouped by account.
//  - For each row, distribute tokens to account

'use strict'

const Logger = require('logplease')
const Sequelize = require('sequelize')

const db = require('../models')
const enums = require('../enums')

const { Campaign } = require('../rules/rules')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('distRewards', { showTimestamp: false })


async function _distributeRewards(account, rewardsForAccount) {
  // Sum up the reward amount.
  // TODO: use BN ?
  const total = rewards.map(reward => reward.amount).reduce((a1, a2) => a1 + a2)


  // Credit the token to the account.
}

async function main() {
  const now = (new Date()).toISOString()

  // Look for campaigns with rewards_status Calculated and distribution date past now.
  const campaignRows = await db.findall({
    where: {
      distributionDate: { [Sequelize.Op.lt]: now },
      rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
    }
  })

  for (const campaignRow of campaignRows) {
    const campaign = new Campaign(campaignRow, campaignRow.rules)
    logger.info(`Calculating rewards for campaign ${campaign.id} (${campaign.name})`)
    let campaignTotal = 0

    // Load rewards rows for this campaign in status Pending and ordered by account.
    const rewards = await db.GrowthRewards.findAll({
      where: {
        campaignId: campaign.Id,
        status: enums.GrowthRewardStatuses.Pending
      },
      order: [ ['ethAddress', 'ASC'] ],
    })

    // Process rewards for each account.
    let account = null
    let rewardsForAccount = []
    for (const reward of rewards ) {
      if (reward.ethAddress !== account) {
        if (rewards.length) {
          await _distributeRewards(account, rewardsForAccount)
        }
        account = reward.ethAddress
        rewardsForAccount = []
      }
    }
  }
}

logger.info('Starting rewards distribution job.')
main()
  .then(logger.info('Finished.'))