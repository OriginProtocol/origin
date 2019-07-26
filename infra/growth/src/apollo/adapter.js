const db = require('../models')
const { GrowthInvite } = require('../resources/invite')
const enums = require('../enums')
const { Money } = require('../util/money')

// Maps rule Id -> Apollo action type.
const ruleIdToActionType = {
  ProfilePublished: 'Profile',
  EmailAttestation: 'Email',
  PhoneAttestation: 'Phone',
  FacebookAttestation: 'Facebook',
  AirbnbAttestation: 'Airbnb',
  TwitterAttestation: 'Twitter',
  GoogleAttestation: 'Google',
  LinkedInAttestation: 'LinkedIn',
  GitHubAttestation: 'GitHub',
  KakaoAttestation: 'Kakao',
  WeChatAttestation: 'WeChat',
  WebsiteAttestation: 'Website',
  Referral: 'Referral',
  // Any listing created.
  ListingCreated: 'ListingCreated',
  // Any listing sold.
  ListingSold: 'ListingSold',
  // Any listing purchased.
  ListingPurchase: 'ListingPurchased',
  // Specific listing purchased.
  ListingPurchaseTShirt: 'ListingIdPurchased',
  ListingPurchaseGC: 'ListingIdPurchased',
  ListingPurchaseCharity: 'ListingIdPurchased',
  ListingPurchaseHousing: 'ListingIdPurchased',
  ListingPurchaseInfluencer: 'ListingIdPurchased',
  ListingPurchaseArt: 'ListingIdPurchased',
  MobileAccountCreated: 'MobileAccountCreated',
  TwitterShare: 'TwitterShare',
  TwitterFollow: 'TwitterFollow'
}

/**
 * Adapts data representing the state of a campaign rule into
 * an Apollo compatible view.
 */
class ApolloAdapter {
  /**
   * Helper function to convert a specific rule Id into a generic Apollo action type.
   * @param {string} ruleId
   * @returns {string}
   * @private
   */
  _ruleIdToActionType(ruleId) {
    let actionType
    // Test if it matches format "ListingPurchase<listingId>"
    // otherwise use the ruleIdToActionType dictionary.
    if (ruleId.match(/^ListingPurchase\d+$/)) {
      actionType = 'ListingIdPurchased'
    } else {
      actionType = ruleIdToActionType[ruleId]
    }
    if (!actionType) {
      throw new Error(`Unexpected ruleId ${ruleId}`)
    }
    return actionType
  }

  /**
   * Fetches referral data.
   * Exists as a separate helper method for ease of mocking in unit tests.
   *
   * @param data
   * @returns {Promise<{Object}>}
   * @private
   */
  async _getReferralsActionData(data) {
    return await GrowthInvite.getReferralsInfo(
      data.ethAddress,
      data.campaign.id,
      data.reward.value,
      data.rewards
    )
  }

  /**
   * Formats data representing the state of a rule into an Apollo compatible view.
   *
   * @param {Object} data - Rule data
   * @returns {Promise<*>}
   */
  async process(data) {
    // Exclude rule from the Apollo view if it is not visible.
    if (!data.visible) {
      return null
    }

    const omitUserData = data.ethAddress === null

    // Fetch common data across all action types.
    let action = {
      ruleId: data.ruleId,
      type: this._ruleIdToActionType(data.ruleId),
      status: data.status,
      limit: data.limit,
      rewardEarned: Money.sum(
        data.rewards.map(r => r.value),
        data.campaign.currency
      ),
      reward: data.reward ? data.reward.value : null,
      unlockConditions: data.unlockConditions
    }

    // Some action types require to fetch extra custom data.
    switch (action.type) {
      case 'Referral':
        if (omitUserData) {
          break
        }

        const referralsInfo = await this._getReferralsActionData(data)
        action = { ...action, ...referralsInfo }
        break
      case 'ListingIdPurchased':
        const listingInfo = {
          listingId: data.listingId,
          iconSrc: data.iconSrc,
          titleKey: data.titleKey,
          detailsKey: data.detailsKey
        }
        action = { ...action, ...listingInfo }
        break
    }

    return action
  }
}

/**
 * Formats the campaign object according to the Growth GraphQL schema. If user is not authenticated only basic campaign data is
 * available without actions and rewards.
 *
 * @param {CampaignRules} crules
 * @param {GrowthParticipantAuthenticationStatus} authentication - user's authentication status
 * @param {string} ethAddress - User's Eth address. This is undefined when user is not authenticated
 * @param {ApolloAdapter} adapter
 * @returns {Promise<{id: *, name: string, startDate: *, endDate: *, distributionDate: (where.distributionDate|{}), status: (Enum<GrowthCampaignStatuses>|Enum<GrowthActionStatus>), actions: any[], rewardEarned: {amount, currency}}>}
 */
const campaignToApolloObject = async (
  crules,
  authentication,
  ethAddress,
  adapter = new ApolloAdapter()
) => {
  const campaign = crules.campaign
  const out = {
    id: campaign.id,
    nameKey: campaign.nameKey,
    shortNameKey: campaign.shortNameKey,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    distributionDate: campaign.distributionDate,
    status: crules.getStatus()
  }

  // User is not enrolled or is banned.
  // Return only basic campaign data.
  if (authentication !== enums.GrowthParticipantAuthenticationStatus.Enrolled) {
    out.actions = await crules.export(adapter, null)
    return out
  }

  // If campaign distribution is finalized, return the total amount paid out,
  // but no other details about actions.
  if (
    campaign.rewardStatus === enums.GrowthCampaignRewardStatuses.Distributed
  ) {
    // Read the payout from the DB
    const payout = await db.GrowthPayout.findOne({
      where: {
        toAddress: ethAddress,
        campaignId: campaign.id,
        status: enums.GrowthPayoutStatuses.Confirmed
      }
    })
    if (!payout) {
      // No payout was made to this account. Return 0 earnings.
      out.rewardEarned = { amount: '0', currency: campaign.currency }
    } else {
      // Return payout made to the account.
      out.rewardEarned = { amount: payout.amount, currency: payout.currency }
    }
    return out
  }

  // Deserialize the current state of the rules for the user into
  // a list of actions.
  out.actions = await crules.export(adapter, ethAddress)

  // Calculate total rewards earned so far.
  const rewards = await crules.getRewards(ethAddress)
  out.rewardEarned = Money.sum(rewards.map(r => r.value), campaign.currency)

  return out
}

module.exports = { ApolloAdapter, campaignToApolloObject }
