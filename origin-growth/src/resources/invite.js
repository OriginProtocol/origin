const db = require('../models')
const { Campaign } = require('./campaign')
const { Rule } = require('../rules/rules')

class Invite {
  // Returns a list of pending rewards:
  //  - get all invites
  //  - filter out invites completed during the current campaign
  //  - filter out invites completed during prior campaign
  static async _getPendingRewards(ethAddress, completedInvites, rewardValue) {
    // Load all invites.
    const invites = db.GrowthInvite.findAll({
      where: { referrerEthAddress: ethAddress }
    })
    const allReferees = invites.map(invite => invite.referrerEthAddress)

    // Filter out referrals completed during the current campaign.
    let pendingReferees = allReferees.filter(referee => {
      return !completedInvites.map(i => i.walletAddress).includes(referee)
    })

    // Load prior campaigns and filter out referrals completed back then.
    const pastCampaigns = Campaign.getPast(ethAddress)
    for (const campaign of pastCampaigns) {
      // TODO(franck): for a campaign for which rewards have been distributed,
      // it could be faster to load the data from the growth_reward table
      // as opposed to recalculating the rules.
      const campaignRule = new Rule(campaign, JSON.parse(campaign.rules))
      const rewards = await campaignRule.getRewards(ethAddress, false)

      pendingReferees = pendingReferees.filter(referee => {
        return !rewards.map(r => r.refereeEthAddress).includes(referee)
      })
    }

    return pendingReferees.map(referee => {
      return {
        refereeEthAddress: referee,
        value: rewardValue
      }
    })
  }

  static async _decorate(reward, status) {
    const referee = reward.refereeEthAddress

    return {
      status,
      walletAddress: referee,
      contactName: null, // TODO: load from identity
      reward: reward.value
    }
  }

  // Returns pending and completed invites for a campaign.
  //
  static async getAll(ethAddress, campaignId) {
    // Load the campaign.
    const campaign = db.GrowthCampaign.findOne({ where: { id: campaignId } })
    if (!campaign) {
      throw new Error('Failed loading campaign with id ${campaignId}')
    }

    // Get list of completed referrals during the campaign by evaluating the rules.
    const campaignRule = new Rule(campaign, JSON.parse(campaign.rules))
    const rewards = await campaignRule.getRewards(ethAddress, false)
    const rewardValue = campaignRule.getReferralRewardValue()
    const completedInvites = rewards.map(r => Invite._decorate(r, 'Completed'))

    // We need to compute pending invites only if the campaign is active.
    let pendingInvites = []
    const now = new Date()
    const isActive = campaign.startDate >= now && campaign.endDate <= now
    if (isActive) {
      const pendingRewards = await Invite._getPendingRewards(
        ethAddress,
        completedInvites,
        rewardValue
      )
      pendingInvites = pendingRewards.map(r => Invite._decorate(r, 'Pending'))
    }

    const allInvites = completedInvites.concat(pendingInvites)

    // Calculate total rewards earned and pending.
    const earnedAmount = rewardValue.amount.times(completedInvites.length)
    const pendingAmount = rewardValue.amount.times(pendingInvites.length)

    return {
      type: 'referral',
      status: isActive ? 'active' : 'completed', // FIXME: use Domen's campaign status method
      rewardEarned: {
        amount: earnedAmount.toFixed(),
        currency: campaign.currency
      },
      rewardPending: {
        amount: pendingAmount.toFixed(),
        currency: campaign.currency
      },
      reward: rewardValue,
      // TODO: honor invites first and after parameter.
      invites: {
        nodes: allInvites,
        pageInfo: {
          // TODO: implement pagination.
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null
        },
        totalCount: allInvites.length()
      }
    }
  }
}

module.exports = { Invite }
