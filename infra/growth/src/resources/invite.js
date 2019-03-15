const BigNumber = require('bignumber.js')

const _growthModels = require('../models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._growthModels, ..._identityModels }
const logger = require('../logger')
const { CampaignRules } = require('./rules')

const DBToSchemaStatus = {
  Sent: 'Pending',
  Completed: 'Completed'
}

class GrowthInvite {
  /**
   * Returns a list of pending rewards:
   *  - get list of referees from growth_invite.
   * @param {string} referrer: ethAddress of the referrer.
   * @param {Array<string>} ignore: list of accounts to ignore
   * @param rewardValue
   * @returns {Promise<*>}
   * @private
   */
  static async _getPendingRewards(referrer, rewardValue) {
    /* Currenlty we only have Pending/Sent invites in GrowthInvite table
     * and the event-listener is not yet attributing referee eth addresses
     * to entries in this table. For that reason we can not yet filter
     * out completed growth addresses out of pending ones.
     *
     * And the pending invites will carry over between different campaigns.
     */

    const referrals = await db.GrowthInvite.findAll({
      where: { referrerEthAddress: referrer.toLowerCase() }
    })

    // // Filter out referrals we are supposed to ignore.
    // const pendingReferees = referrals.filter(
    //   r => !ignore.includes(r.refereeEthAddress)
    // )

    // // Load prior campaigns and filter out referrals completed during those.
    // const pastCampaigns = GrowthCampaign.getPast(referrer)
    // for (const campaign of pastCampaigns) {
    //   // TODO(franck): for a campaign for which rewards have already been
    //   // distributed, it could be faster to load the data from the
    //   // growth_reward table as opposed to recalculating the rules.
    //   const rewards = await campaign.getRewards(referrer, false)
    //   // Get list of addresses for referees for which referral was completed
    //   // during that campaign.
    //   const referees = rewards
    //     .filter(r => r.constructor.name === 'ReferralReward') // Filter out non-referral rewards.
    //     .map(r => r.refereeEthAddress)
    //   // Filter out those completed referrals from our pendingReferees list.
    //   pendingReferees.filter(r => !referees.includes(r.refereeEthAddress))
    // }

    return referrals.map(r => {
      return {
        id: r.id,
        contact: r.refereeContact,
        status: DBToSchemaStatus[r.status],
        reward: rewardValue
      }
    })
  }

  /**
   * Creates a referrer - referee connection in case this referee does not have a referrer yet
   *
   * @param {string} code - growth invitation code
   */
  static async makeReferralConnection(code, walletAddress) {
    try {
      const referralLink = await db.GrowthReferral.findOne({
        where: {
          refereeEthAddress: walletAddress.toLowerCase()
        }
      })
      const referrer = await GrowthInvite._getReferrer(code)

      if (referrer === walletAddress.toLowerCase()) {
        logger.debug(`Referrer ${referrer} can't use own referral code`)
        return
      }

      if (
        referralLink &&
        referralLink.referrerEthAddress.toLowerCase() !== referrer.toLowerCase()
      ) {
        /* The referrer associated with the invite code does not match previously stored referrer.
         * A corner case scenario this might happen is as follow:
         *  - referee receives multiple invites.
         *  - referee clicks on an invite and enrolls into growth campaing
         *  - referee clicks on another invite link and enrolls again into
         *  growth campaign.
         *
         * When this happens we ignore the subsequent invites and attribute all
         * referees actions to the initial referrer.
         *
         */
        logger.warn(
          `Referee ${walletAddress} already referred by ${
            referralLink.referrerEthAddress
          }`
        )
        return
      }

      await db.GrowthReferral.create({
        referrerEthAddress: referrer,
        refereeEthAddress: walletAddress.toLowerCase()
      })

      logger.info(
        `Recorded referral. Referrer: ${referrer} Referee: ${walletAddress}`
      )
    } catch (e) {
      logger.warn(
        `Can not make referral connection for user ${walletAddress}: `,
        e.message,
        e.stack
      )
    }
  }

  /**
   *
   * @param {ReferralReward} reward of type referral.
   * @param {string} status to set
   * @returns {Promise<{status:string, walletAddress:string, contactName:string, reward:{amount:string, currency:string}}>}
   * @private
   */
  static async _decorate(reward, status) {
    const referee = reward.refereeEthAddress

    let identity = await db.Identity.findOne({
      where: { ethAddress: referee }
    })
    if (!identity) {
      // Defensive coding. This should theoretically not happen.
      logger.error(`Failed loading identity for referee ${referee}`)
      identity = { firstName: '', lastName: '' }
    }

    return {
      status,
      walletAddress: referee,
      // TODO: when we only have users' email on the record show that
      contact: (identity.firstName || '') + ' ' + (identity.lastName || ''),
      reward: reward.value
    }
  }

  // Returns information about pending and completed referrals for a campaign
  static async getReferralsInfo(ethAddress, campaignId) {
    // Load the campaign.
    const campaign = await db.GrowthCampaign.findOne({
      where: { id: campaignId }
    })
    if (!campaign) {
      throw new Error('Failed loading campaign with id ${campaignId}')
    }

    // Get list of referrals completed during the campaign by evaluating its rules.
    const crules = new CampaignRules(campaign, JSON.parse(campaign.rules))
    const rewards = await crules.getRewards(ethAddress, false)
    const rewardValue = crules.getReferralRewardValue()
    const completedInvites = rewards
      .filter(r => r.constructor.name === 'ReferralReward') // Filter out non-referral rewards.
      .map(r => GrowthInvite._decorate(r, 'Completed')) // Decorate with extra info.

    // We need to compute pending invites only if the campaign is active.
    let pendingInvites = []
    const now = new Date()
    const isActive = campaign.startDate <= now && campaign.endDate >= now
    if (isActive) {
      //const ignore = completedInvites.map(i => i.walletAddress)
      pendingInvites = await GrowthInvite._getPendingRewards(
        ethAddress,
        rewardValue
      )
    }

    const allInvites = completedInvites.concat(pendingInvites)

    // Calculate total rewards earned and pending.
    const rewardAmount = rewardValue
      ? BigNumber(rewardValue.amount)
      : BigNumber(0)
    const earnedAmount = rewardAmount.times(completedInvites.length)
    const pendingAmount = rewardAmount.times(pendingInvites.length)

    return {
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
        totalCount: allInvites.length
      }
    }
  }

  // Returns enrolled user's invite code
  static async getInviteCode(accountId) {
    const inviteCode = await db.GrowthInviteCode.findOne({
      where: { ethAddress: accountId }
    })
    if (!inviteCode) {
      throw new Error(`Can not fetch invite code for user: ${accountId}`)
    }
    return inviteCode.code
  }

  static async _getReferrer(code) {
    // Lookup the code.
    const inviteCode = await db.GrowthInviteCode.findOne({ where: { code } })
    if (!inviteCode) {
      throw new Error('Invalid invite code')
    }
    return inviteCode.ethAddress
  }

  // Returns referrer's information based on an invite code.
  static async getReferrerInfo(code) {
    const referrer = await GrowthInvite._getReferrer(code)

    // Load the referrer's identity.
    // TODO(franck): Once our data model and GraphQL services interfaces are
    // stable, we should consider:
    //  a. fetching identity by making a call to the identity graphql endpoint.
    //  b. putting all the identity code in a separate origin-identity package.
    const identity = await db.Identity.findOne({
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

module.exports = { GrowthInvite }
