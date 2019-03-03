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
    ListingSold: 'ListingSold',
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
  currentUserLevel,
  allRules
) => {
  const ruleRewards = _rewardsForRule(rule, rewards)
  return {
    // TODO: we need event types for MultiEventsRule
    type: eventTypeToActionType(rule.config.eventTypes[0]),
    status: await rule.getStatus(ethAddress, events, currentUserLevel),
    rewardEarned: sumUpRewards(ruleRewards, rule.campaign.currency),
    reward: rule.config.reward,
    unlockConditions: conditionToUnlockRule(rule, allRules)
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
  currentUserLevel,
  allRules
) => {
  const ruleRewards = _rewardsForRule(rule, rewards)
  return {
    type: eventTypeToActionType(rule.config.eventType),
    status: await rule.getStatus(ethAddress, events, currentUserLevel),
    rewardEarned: sumUpRewards(ruleRewards, rule.campaign.currency),
    reward: rule.config.reward,
    unlockConditions: conditionToUnlockRule(rule, allRules)
  }
}

const referralRuleApolloObject = async (
  rule,
  ethAddress,
  rewards,
  events,
  currentUserLevel,
  allRules
) => {
  const status = await rule.getStatus(ethAddress, events, currentUserLevel)
  const referralsInfo = await GrowthInvite.getReferralsInfo(
    ethAddress,
    rule.campaignId
  )
  return {
    type: 'Referral',
    unlockConditions: conditionToUnlockRule(rule, allRules),
    ...referralsInfo,
    status
  }
}

const conditionToUnlockRule = (rule, allRules) => {
  return allRules
    .filter(allRule => allRule.levelId === rule.levelId - 1)
    .filter(allRule => allRule.config.nextLevelCondition === true)
    .map(allRule => {
      return {
        messageKey: allRule.config.conditionTranslateKey,
        iconSource: allRule.config.conditionIcon
      }
    })
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

  const apolloActions = await Promise.all(
    rules
      .filter(async rule => rule.isVisible())
      .map(rule => {
        if (rule.constructor.name === 'SingleEventRule')
          return singleEventRuleApolloObject(
            rule,
            ethAddress,
            rewards,
            events,
            currentLevel,
            rules
          )
        else if (rule.constructor.name === 'MultiEventsRule')
          return multiEventRuleApolloObject(
            rule,
            ethAddress,
            rewards,
            events,
            currentLevel,
            rules
          )
        else if (rule.constructor.name == 'ReferralRule')
          return referralRuleApolloObject(
            rule,
            ethAddress,
            rewards,
            events,
            currentLevel,
            rules
          )
      }))

  return {
    id: campaign.campaign.id,
    nameKey: campaign.campaign.nameKey,
    shortNameKey: campaign.campaign.shortNameKey,
    name: campaign.campaign.name,
    startDate: campaign.campaign.startDate,
    endDate: campaign.campaign.endDate,
    distributionDate: campaign.campaign.distributionDate,
    status: campaign.getStatus(),
    actions: apolloActions,
    rewardEarned: sumUpRewards(rewards, campaign.campaign.currency)
  }
}

module.exports = { campaignToApolloObject }
