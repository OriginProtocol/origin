const BigNumber = require('bignumber.js')
const { GrowthInvite } = require('../resources/invite')

const sumUpRewards = (rewards, currency) => {
  if (rewards === null || rewards.length === 0) {
    return { amount: '0', currency }
  }
  rewards = rewards.map(reward => reward.value)
  
  const totalReward = rewards.reduce((first, second) => {
    if (first.currency !== second.currency)
      throw new Error(
        `At least two rewards have different currencies. ${first.currency} ${
          second.currency
        }`
      )
    return {
      amount: BigNumber(first.amount).plus(BigNumber(second.amount)),
      currency: first.currency
    }
  })

  return {
    amount: totalReward.amount.toString(),
    currency: totalReward.currency
  }
}

const eventTypeToActionType = eventType => {
  const eventToActionType = {
    ProfilePublished: 'Profile',
    EmailAttestationPublished: 'Email',
    FacebookAttestationPublished: 'Facebook',
    AirbnbAttestationPublished: 'Airbnb',
    TwitterAttestationPublished: 'Twitter',
    PhoneAttestationPublished: 'Phone',
    RefereeSignedUp: 'Referral',
    ListingCreated: 'ListingCreated',
    ListingPurchased: 'ListingPurchased'
  }

  return eventToActionType[eventType]
}

/**
 * Returns rewards earned from a specific rule
 * @param {BaseRule} rule
 * @param {Array<Reward>} rewards
 * @returns {Array<reward>}
 * @private
 */
const _rewardsForRule = (rule, rewards) => {
  return rewards.filter(r => r.ruleId === rule.id)
}

/**
 * Formats the campaign object according to the Growth schema
 *
 * @returns {Object} - formatted object
 */
const multiEventRuleApolloObject = async (
  rule,
  ethAddress,
  rewards,
  events,
  currentUserLevel
) => {
  const ruleRewards = _rewardsForRule(rule, rewards)
  return {
    // TODO: we need event types for MultiEventsRule
    type: eventTypeToActionType(rule.config.eventTypes[0]),
    status: rule.getStatus(ethAddress, events, currentUserLevel),
    rewardEarned: sumUpRewards(ruleRewards, rule.campaign.currency),
    reward: rule.config.reward
  }
}

/**
 * Formats the campaign object according to the Growth schema
 *
 * @returns {Object} - formatted object
 */
const singleEventRuleApolloObject = async (
  rule,
  ethAddress,
  rewards,
  events,
  currentUserLevel
) => {
  const ruleRewards = _rewardsForRule(rule, rewards)
  return {
    type: eventTypeToActionType(rule.config.eventType),
    status: rule.getStatus(ethAddress, events, currentUserLevel),
    rewardEarned: sumUpRewards(ruleRewards, rule.campaign.currency),
    reward: rule.config.reward
  }
}

const referralRuleApolloObject = async (
  rule,
  ethAddress,
  rewards,
  events,
  currentUserLevel
) => {
  const status = await rule.getStatus(ethAddress, events, currentUserLevel)
  const referralsInfo = await GrowthInvite.getReferralsInfo(
    ethAddress,
    rule.campaignId
  )
  return Object.assign({ type: 'Referral', status }, referralsInfo)
}

/**
 * Formats the campaign object according to the Growth GraphQL schema.
 * @param {CampaignRules} campaign
 * @param {string} ethAddress - User's Eth address.
 * @returns {Promise<{id: *, name: string, startDate: *, endDate: *, distributionDate: (where.distributionDate|{}), status: (Enum<GrowthCampaignStatuses>|Enum<GrowthActionStatus>), actions: any[], rewardEarned: {amount, currency}}>}
 */
const campaignToApolloObject = async (campaign, ethAddress) => {
  const events = await campaign.getEvents(ethAddress)
  const levels = Object.values(campaign.levels)
  const rules = levels.flatMap(level => level.rules)
  const currentLevel = await campaign.getCurrentLevel(ethAddress, false)
  const rewards = await campaign.getRewards(ethAddress)

  return {
    id: campaign.campaign.id,
    nameKey: campaign.campaign.nameKey,
    shortNameKey: campaign.campaign.shortNameKey,
    name: campaign.campaign.name,
    startDate: campaign.campaign.startDate,
    endDate: campaign.campaign.endDate,
    distributionDate: campaign.campaign.distributionDate,
    status: campaign.getStatus(),
    actions: rules
      .filter(rule => rule.isVisible())
      .map(rule => {
        if (rule.constructor.name === 'SingleEventRule')
          return singleEventRuleApolloObject(
            rule,
            ethAddress,
            rewards,
            events,
            currentLevel
          )
        else if (rule.constructor.name === 'MultiEventsRule')
          return multiEventRuleApolloObject(
            rule,
            ethAddress,
            rewards,
            events,
            currentLevel
          )
        else if (rule.constructor.name == 'ReferralRule')
          return referralRuleApolloObject(
            rule,
            ethAddress,
            rewards,
            events,
            currentLevel
          )
      }),
    rewardEarned: sumUpRewards(rewards, campaign.campaign.currency)
  }
}

module.exports = { campaignToApolloObject }
