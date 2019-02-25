const db = require('../models')
const db2 = require('origin-discovery/src/models')
const logger = require('../logger')

const { GrowthCampaign } = require('./campaign')
const { Rule } = require('../rules/rules')


class Invite {
  // Returns a list of pending rewards:
  //  - get all invites
  //  - filter out invites completed during the current campaign
  //  - filter out invites completed during prior campaign
  static async _getPendingRewards(ethAddress, completedInvites, rewardValue) {
    // Load all invites.
    const invites = db.Invite.findAll({
      where: { referrerEthAddress: ethAddress }
    })
    const allReferees = invites.map(invite => invite.referrerEthAddress)

    // Filter out referrals completed during the current campaign.
    let pendingReferees = allReferees.filter(referee => {
      return !completedInvites.map(i => i.walletAddress).includes(referee)
    })

    // Load prior campaigns and filter out referrals completed back then.
    const pastCampaigns = GrowthCampaign.getPast(ethAddress)
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

    const identity = await db2.Identity.findOne({
      where: { ethAddress: referee }
    })
    if (!identity) {

      return { firstName: '', lastName: '' }
    }

    return {
      status,
      walletAddress: referee,
      contactName: null, // TODO: load from identity
      reward: reward.value
    }
  }

  // Returns pending and completed invites for a campaign.
  //
  static async getInvitesStatus(ethAddress, campaignId) {
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

  // Returns referrer's information based on an invite code.
  static async getReferrerInfo(code) {
    // Lookup the code.
    const inviteCode = await db.InviteCode.findOne({ where: { code } })
    if (!inviteCode) {
      throw new Error('Invalid invite code')
    }
    const referrer = inviteCode.ethAddress

    // Load the referrer's identity.
    // TODO(franck): Once our data model and GraphQL services interfaces are
    // stable, we should consider:
    //  a. fetching identity by making a call to the identity graphql endpoint.
    //  b. putting all the identity code in a separate origin-identity package.
    const identity = await db2.Identity.findOne({
      where: { ethAddress: referrer }
    })
    if (!identity) {
      // This should never happen since before being allowed to send any
      // referral invitation, a referrer must publish their profile.
      logger.error(`Failed loading identity for referrer ${referrer}`)
      return { firstName: '', lastName: '' }
    }

    return {
      firstName: identity.firstName,
      lastName: identity.lastName
    }
  }
}


module.exports = { Invite }
