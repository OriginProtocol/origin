const db = require('../models')
const { GrowthEventTypes, GrowthEventStatuses } = require('../enums')

// System cap for number of rewards per rule.
const MAX_NUM_REWARDS_PER_RULE = 1000


class Reward {
  constructor(campaignId, levelId, ruleId, money) {
    this.campaignId = campaignId
    this.levelId = levelId
    this.ruleId = ruleId
    this.money = money
  }
}


/**
 * TODO: include logic for
 *  - start_date: Date at which campaign starts
 *  - end_date: Date at which campaign ends assuming cap not exhausted
 *  - cap
 *  - cap_used
 *
 */
class Campaign {
  constructor(campaign, config) {
    this.campaign = campaign
    this.config = config

    if (!this.config.numLevels ||
      !Number.isInteger(this.config.numLevels) ||
      this.config.numLevels <= 0) {
      throw new Error(`Campaign ${campaign.id}: invalid or missing numLevels field.`)
    }
    this.numLevels = this.config.numLevels

    this.levels = {}
    for (let i = 0; i < this.config.numLevels; i++) {
      if (!this.config.levels[i]) {
        throw new Error(`Campaign ${this.campaign.id}: missing level ${i}`)
      }
      this.levels[i] = new Level(this.campaign.id, i, this.config.levels[i])
    }
  }

  getEvents(ethAddress) {
    const whereClause = { ethAddress: ethAddress.toLowerCase() }
    // TODO: filter out events out of the campaign time window.
    // FIXME: this should await
    const events = db.GrowthEvent.findAll({
        where: whereClause,
        order: [ ['id', 'ASC'] ],
      }
    )
    return events
  }

  getCurrentLevel(ethAddress) {
    const events = this.getEvents(ethAddress)
    let level
    for (level = 0; level < this.config.numLevels - 1; level++) {
      if (!this.levels[level].qualifyForNextLevel(ethAddress, events)) {
        break
      }
    }
    return level
  }

  getRewards(ethAddress) {
    const rewards = {}
    const events = this.getEvents(ethAddress)
    const currentLevel = this.getCurrentLevel(ethAddress, events)
    for (let i = 0; i <= currentLevel; i++) {
      rewards[i] = this.levels[i].getRewards(ethAddress, events)
    }
    return rewards
  }
}


class Level {
  constructor(campaignId, levelId, config) {
    this.campaignId = campaignId
    this.id = levelId
    this.config = config

    this.rules =[]
    config.rules.forEach(ruleConfig => {
      const rule = ruleFactory(campaignId, levelId, ruleConfig)
      this.rules.push(rule)
    })
  }

  qualifyForNextLevel(ethAddress, events) {
    for (let i = 0; i < this.rules.length; i++) {
      const result = this.rules[i].qualifyForNextLevel(ethAddress, events)
      if (result != null && result === false) {
        return false
      }
    }
    return true
  }

  getRewards(ethAddress, events) {
    const rewards = {}
    this.rules.forEach(rule => {
      rewards[rule.id] = rule.getRewards(ethAddress, events)
    })
    return rewards
  }
}


function ruleFactory(campaignId, levelId, config) {
  let rule
  switch (config.class) {
    case 'SingleEvent':
      rule = new SingleEventRule(campaignId, levelId, config)
      break
    case 'MultiEvents':
      rule = new MultiEventsRule(campaignId, levelId, config)
      break
    default:
      throw new Error(`Unexpected or missing rule class ${config.class}`)
  }
  return rule
}


class BaseRule {
  constructor(campaignId, levelId, config) {
    this.campaignId = campaignId
    this.levelId = levelId
    this.id = config.id
    this.config = config.config

    if (!this.config.limit) {
      throw new Error(`${this.str()}: missing limit`)
    }
    this.limit = Math.min(this.config.limit, MAX_NUM_REWARDS_PER_RULE)

    if (this.config.reward) {
      const money = {
        amount: this.config.reward.amount,
        currency: this.config.reward.currency
      }
      this.reward = new Reward(this.campaignId, this.levelId, this.id, money)
    } else {
      this.reward = null
    }
  }

  str() {
    return `Campaign ${this.campaignId} / Rule ${this.ruleId} / Level ${this.levelId}`
  }

  qualifyForNextLevel(ethAddress, events) {
    // If the rule is not part of the upgrade condition, return right away.
    if (!this.config.upgradeCondition) {
      return null
    }

    // Evaluate the rule based on events.
    return this.evaluate(ethAddress, events)
  }

  _tallyEvents(ethAddress, eventTypes, events) {
    const tally = {}
    events
      .filter(event => {
        return (
          (event.ethAddress === ethAddress) &&
          eventTypes.includes(event.type) &&
          (event.status === GrowthEventStatuses.Logged ||
           event.status === GrowthEventStatuses.Verified))
      })
      .forEach(event => {
         tally[event.type] = tally.hasOwnProperty(event.type) ? tally[event.type] + 1 : 1
      })
    return tally
  }

  getRewards(ethAddress, events) {
    // If this rule does not give out reward, return right away.
    if (!this.reward) {
      return []
    }

    const numRewards = this._numRewards(ethAddress, events)
    const rewards = Array(numRewards).fill(this.reward)

    return rewards
  }
}


class SingleEventRule extends BaseRule {
  constructor(campaignId, levelId, config) {
    super(campaignId, levelId, config)

    const eventType = this.config.eventType
    if (!eventType) {
      throw new Error(`${this.str()}: missing eventType field`)
    } else if (!GrowthEventTypes.includes(eventType)) {
      throw new Error(`${this.str()}: unknown eventType ${eventType}`)
    }
    this.eventTypes = [eventType]
  }

  _numRewards(ethAddress, events) {
    const tally = this._tallyEvents(ethAddress, this.eventTypes, events)
    return Object.keys(tally).length ? Math.min(...Object.values(tally), this.limit) : 0
  }

  evaluate(ethAddress, events) {
    const tally = this._tallyEvents(ethAddress, this.eventTypes, events)
    return (Object.keys(tally).length === 1)
  }
}

class MultiEventsRule extends BaseRule {
  constructor(campaignId, levelId, config) {
    super(campaignId, levelId, config)

    if (!this.config.eventTypes) {
      throw new Error(`${this.str()}: missing eventTypes field`)
    }
    this.config.eventTypes.forEach(eventType => {
      if (!GrowthEventTypes.includes(eventType)) {
        throw new Error(`${this.str()}: unknown eventType ${eventType}`)
      }
    })
    this.eventTypes = this.config.eventTypes

    if (!this.config.numEventsRequired ||
      !Number.isInteger(this.config.numEventsRequired) ||
      this.config.numLevels <= 0) {
      throw new Error(`${this.str()}: missing or invalid numEventsRequired`)
    }
    this.numEventsRequired = this.config.numEventsRequired
  }

  _numRewards(ethAddress, events) {
    function pickN(tally, n) {
      let numPicked = 0
      for (const key of Object.keys(tally)) {
        if (tally[key] > 0) {
          tally[key]--
          numPicked++
        }
        if (numPicked === n) {
          break
        }
      }
      return numPicked === n
    }

    const tally = this._tallyEvents(ethAddress, this.eventTypes, events)
    let numRewards = 0
    while ((numRewards < this.limit) && pickN(tally, this.numEventsRequired)) {
      numRewards++
    }
    return numRewards
  }

  evaluate(ethAddress, events) {
    const tally = this._tallyEvents(ethAddress, this.eventTypes, events)
    return (Object.keys(tally).length >= this.numEventsRequired)
  }
}

module.exports = {
  Campaign
}