const { GrowthInvite } = require('../resources/invite')
const enums = require('../enums')
const { Money } = require('../util/money')

/**
 * Adapts data representing the state of a campaign rule into
 * an Apollo compatible view.
 */
class ApolloAdapter {
  /**
   * Helper function to convert a growth event type into an Apollo action type.
   * @param eventType
   * @returns {*}
   * @private
   */
  _eventTypeToActionType(eventType) {
    const eventToActionType = {
      ProfilePublished: 'Profile',
      EmailAttestationPublished: 'Email',
      FacebookAttestationPublished: 'Facebook',
      AirbnbAttestationPublished: 'Airbnb',
      TwitterAttestationPublished: 'Twitter',
      PhoneAttestationPublished: 'Phone',
      Referral: 'Referral',
      ListingCreated: 'ListingCreated',
      ListingSold: 'ListingSold',
      ListingPurchased: 'ListingPurchased'
    }
    return eventToActionType[eventType]
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
      data.reward,
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
    let action = {
      // TODO: handle multi-events type
      type: this._eventTypeToActionType(data.eventTypes[0]),
      status: data.status,
      rewardEarned: Money.sum(data.rewards, data.campaign.currency),
      reward: data.reward,
      unlockConditions: data.unlockConditions
    }

    // Add extra information in case of a Referral.
    if (action.type === 'Referral') {
      const referralsInfo = await this._getReferralsActionData(data)
      action = { ...action, ...referralsInfo }
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
  const out = {
    id: crules.campaign.id,
    nameKey: crules.campaign.nameKey,
    shortNameKey: crules.campaign.shortNameKey,
    name: crules.campaign.name,
    startDate: crules.campaign.startDate,
    endDate: crules.campaign.endDate,
    distributionDate: crules.campaign.distributionDate,
    status: crules.getStatus()
  }

  // User is not enrolled. Return only basic campaign data.
  if (authentication !== enums.GrowthParticipantAuthenticationStatus.Enrolled) {
    return out
  }

  // Deserialize the current state of the rules for the user into
  // a list of actions.
  out.actions = await crules.export(adapter, ethAddress)

  // Calculate total rewards earned so far.
  const rewards = await crules.getRewards(ethAddress)
  out.rewardEarned = Money.sum(rewards, crules.campaign.currency)

  return out
}

module.exports = { ApolloAdapter, campaignToApolloObject }
