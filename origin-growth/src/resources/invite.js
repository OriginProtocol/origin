const BigNumber = require('bignumber.js')

const db = require('../models')
const { GrowthInviteStatuses } = require('../enums')


class Invite {

  // Returns all invites and associated status as well as earnings.
  /**
    type ReferralAction implements GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus!
    rewardEarned: Price
    rewardPending: Price
    reward: Price!            # information about reward
    # first property specifies the number of items to return
    # after is the cursor
    invites(first: Int, after: String): [GrowthInviteConnection]
  */

  static async getAll(ethAddress, campaignId) {
    // Load the campaign.
    const campaign = db.GrowthCampaign.findOne({ where: { id: campaignId } })
    if (!campaign) {
      throw new Error('Failed loading campaign with id ${campaignId}')
    }

    // Load all invites.
    let invites = db.GrowthInvite.findAll({
      where: { referrerEthAddress: ethAddress }
    })

    // Filter out invites that were completed outside of the campaign's window.
    invites = invites.filter(invite => {
      return (invite.status !== GrowthInviteStatuses.Completed ||
        (invite.updatedAt >= campaign.stardDate && invite.updatedAt <= campaign.endDate))
    })

    const completedInvites = invites
      .filter(invite => invite.status === GrowthInviteStatuses.Completed)

    const pendingInvites = invites
      .filter(invite => invite.status !== GrowthInviteStatuses.Completed)

    // TODO: get the reward amount for a referral.
    const rewardAmount = BigNumber(1)

    // Calculate total rewards earned during the campaign.
    const earnedAmount = rewardAmount.times(completedInvites.length)

    // Calculate total rewards that are pending.
    const pendingAmount = rewardAmount.times(pendingInvites.length)

    return {
      type: 'referral',
      status: 'active', // FIXME: use Domen's campaign status method
      rewardEarned: {
        amount: earnedAmount.toFixed(),
        currency: campaign.currency
      },
      rewardPending: {
        amount: pendingAmount.toFixed(),
        currency: campaign.currency
      },
      reward: {
        amount: rewardAmount.toFixed(),
        currency: campaign.currency
      },
      // TODO: honor invites first and after parameter.
      invites: {
        nodes: invites.map(invite => {
          return {
            status: invite.status,
            walletAddress: null, // TODO: load from growth_referral
            contactName: null, // TODO: load from identity
            reward: {
              amount: rewardAmount.toFixed(),
              currency: campaign.currency
            }
          }
        }),
        pageInfo: {
          // TODO: implement pagination.
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
        },
        totalCount: invites.length()
      }
    }
  }
}