const BigNumber = require('bignumber.js')

const sumUpRewards = rewards => {
  if (rewards === null || rewards.length === 0) {
    return null
  }

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
 * Formats the campaign object according to the Growth schema
 *
 * @returns {Object} - formatted object
 */
const multiEventRuleApolloObject = async (
  rule,
  ethAddress,
  events,
  currentUserLevel
) => {
  const rewards = rule.getRewards(ethAddress, events)

  return {
    // TODO: we need event types for MultiEventsRule
    type: eventTypeToActionType(rule.config.eventTypes[0]),
    status: rule.getStatus(ethAddress, events, currentUserLevel),
    rewardEarned: sumUpRewards(rewards),
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
  events,
  currentUserLevel
) => {
  const rewards = await rule.getRewards(ethAddress, events)
  const objectToReturn = {
    type: eventTypeToActionType(rule.config.eventType),
    status: rule.getStatus(ethAddress, events, currentUserLevel),
    rewardEarned: sumUpRewards(rewards),
    reward: rule.config.reward
  }

  if (objectToReturn.type === 'Referral') {
    // TODO implement this
    objectToReturn.rewardPending = rule.config.reward
  }

  return objectToReturn
}

const referralRuleApolloObject = async (ethAddress, events, currentUserLevel) => {

  const rewards = await this.getRewards(ethAddress)

  return {
    type: 'Referral',
    status: await this.getStatus(ethAddress, events, currentUserLevel),
    rewardEarned: sumUpRewards(rewards),
    reward: this.config.reward
  }
}

/**
 * Formats the campaign object according to the Growth schema
 *
 * @returns {Object} - formatted object
 */
const campaignToApolloObject = async (campaign, ethAddress) => {
  //TODO: change to true, true
  //const events = this.getEvents(ethAddress, true, true)
  const events = await campaign.getEvents(ethAddress, false, false)
  const levels = Object.values(campaign.levels)
  const rules = levels.flatMap(level => level.rules)
  const currentLevel = await campaign.getCurrentLevel(ethAddress, false)

  return {
    id: campaign.campaign.id,
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
            events,
            currentLevel
          )
        else if (rule.constructor.name === 'MultiEventsRule')
          return multiEventRuleApolloObject(
            rule,
            ethAddress,
            events,
            currentLevel
          )
        else if (rule.constructor.name == 'ReferralRule')
          return referralRuleApolloObject(
            rule,
            ethAddress,
            currentLevel
          )
      }),
    rewardEarned: sumUpRewards(
      levels.flatMap(level => level.getRewards(ethAddress, events))
    )
  }
}

module.exports = { campaignToApolloObject }
