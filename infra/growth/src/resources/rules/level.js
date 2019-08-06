const { SingleEventRule } = require('./singleEventRule')
const { MultiEventsRule } = require('./multiEventsRule')
const { ReferralRule } = require('./referralRule')
const { ListingIdPurchaseRule } = require('./listingIdPurchaseRule')
const { SocialShareRule } = require('./socialShareRule')

class Level {
  constructor(crules, levelId, config) {
    this.crules = crules
    this.campaignId = crules.campaign.id
    this.id = levelId
    this.config = config

    this.rules = config.rules.map(ruleConfig => {
      const rule = ruleFactory(crules, levelId, ruleConfig)
      // Add the rule to the global list of rules.
      this.crules.allRules.push(rule)
      return rule
    })
  }

  async qualifyForNextLevel(ethAddress, events) {
    for (const rule of this.rules) {
      const result = await rule.qualifyForNextLevel(ethAddress, events)
      if (result !== null && result === false) {
        return false
      }
    }
    return true
  }

  async getEarnedRewards(ethAddress, events) {
    const rewards = []
    for (const rule of this.rules) {
      const ruleRewards = await rule.getEarnedRewards(ethAddress, events)
      rewards.push(...ruleRewards)
    }

    return rewards
  }

  /**
   * Walks thru all the rules and calls the adapter with data for each rule.
   *
   * @param {Adapter} adapter - Class to use for formatting the rule data.
   * @param {string} ethAddress
   * @param {Array<models.GrowthEvent>}
   * @param {number} level
   * @returns {Promise<Array<Object>>} List representing state of each rule.
   */
  async export(adapter, ethAddress, events, level) {
    return (await Promise.all(
      this.rules.map(rule => rule.export(adapter, ethAddress, events, level))
    )).filter(data => data)
  }
}

function ruleFactory(crules, levelId, config) {
  let rule
  switch (config.class) {
    case 'SingleEvent':
      rule = new SingleEventRule(crules, levelId, config)
      break
    case 'MultiEvents':
      rule = new MultiEventsRule(crules, levelId, config)
      break
    case 'Referral':
      rule = new ReferralRule(crules, levelId, config)
      break
    case 'ListingIdPurchase':
      rule = new ListingIdPurchaseRule(crules, levelId, config)
      break
    case 'SocialShare':
      rule = new SocialShareRule(crules, levelId, config)
      break
    default:
      throw new Error(`Unexpected or missing rule class ${config.class}`)
  }
  return rule
}

module.exports = { Level }
