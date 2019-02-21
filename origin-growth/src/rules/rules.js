const Sequelize = require('sequelize')

const db = require('../models')
const { GrowthEventTypes, GrowthEventStatuses } = require('../enums')

// System cap for number of rewards per rule.
const MAX_NUM_REWARDS_PER_RULE = 1000

class Reward {
  constructor(campaignId, levelId, ruleId, value) {
    this.campaignId = campaignId
    this.levelId = levelId
    this.ruleId = ruleId
    this.value = value // <{amount: string, currency: string}>
  }
}

class Campaign {
  constructor(campaign, config) {
    this.campaign = campaign
    this.config = config

    if (
      !this.config.numLevels ||
      !Number.isInteger(this.config.numLevels) ||
      this.config.numLevels <= 0
    ) {
      throw new Error(
        `Campaign ${campaign.id}: invalid or missing numLevels field.`
      )
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

  /**
   * Reads events related to a user from the DB.
   * @param {string} ethAddress - User's account.
   * @param {boolean} duringCampaign - Restricts query to events that occurred
   *  during the campaign vs since user signed up.
   * @param {boolean} onlyVerified - Only returns events with status
   *   Verified. Otherwise returns events with status Verified or Logged.
   * @returns {Promise<Array<models.GrowthEvent>>}
   */
  async getEvents(ethAddress, duringCampaign, onlyVerified) {
    const whereClause = {
      ethAddress: ethAddress.toLowerCase()
    }

    if (duringCampaign) {
      // Note: restrict the query by using the capReachedDate (that's the case where the
      // campaign was exhausted before its end date) or the campaign end date.
      const endDate = this.campaign.capReachedDate || this.campaign.endDate
      whereClause.createdAt = {
        [Sequelize.Op.gte]: this.campaign.startDate,
        [Sequelize.Op.lt]: endDate
      }
    }

    if (onlyVerified) {
      whereClause.status = GrowthEventStatuses.Verified
    } else {
      whereClause.status = {
        [Sequelize.Op.in]: [
          GrowthEventStatuses.Logged,
          GrowthEventStatuses.Verified
        ]
      }
    }

    const events = await db.GrowthEvent.findAll({
      where: whereClause,
      order: [['id', 'ASC']]
    })
    return events
  }

  /**
   * Calculates the current campaign level the user is at.
   * Considers events that occurred since user joined the platform.
   *
   * @param {string} ethAddress - User's account.
   * @param {boolean} onlyVerifiedEvents - Only use events with status Verified
   *   for the calculation. Otherwise uses events with status Verified or Logged.
   * @returns {Promise<number>}
   */
  async getCurrentLevel(ethAddress, onlyVerifiedEvents) {
    const events = await this.getEvents(ethAddress, false, onlyVerifiedEvents)
    let level
    for (level = 0; level < this.config.numLevels - 1; level++) {
      if (!this.levels[level].qualifyForNextLevel(ethAddress, events)) {
        break
      }
    }
    return level
  }

  /**
   * Calculates rewards earned by the user.
   * Only considers events that occurred during the campaign.
   *
   * @param {string} ethAddress - User's account.
   * @param {boolean} onlyVerifiedEvents - Only use events with status Verified
   *   for the calculation. Otherwise uses events with status Verified or Logged.
   * @returns {Promise<Array<Reward>>} - List of rewards, in no specific order.
   */
  async getRewards(ethAddress, onlyVerifiedEvents) {
    const rewards = []
    const events = await this.getEvents(ethAddress, true, onlyVerifiedEvents)
    const currentLevel = await this.getCurrentLevel(
      ethAddress,
      onlyVerifiedEvents
    )
    for (let i = 0; i <= currentLevel; i++) {
      rewards.push(...this.levels[i].getRewards(ethAddress, events))
    }
    return rewards
  }
}

class Level {
  constructor(campaignId, levelId, config) {
    this.campaignId = campaignId
    this.id = levelId
    this.config = config

    this.rules = config.rules.map(ruleConfig =>
      ruleFactory(campaignId, levelId, ruleConfig)
    )
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
    const rewards = []
    this.rules.forEach(rule => {
      rewards.push(...rule.getRewards(ethAddress, events))
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

    if (this.config.reward && !this.config.limit) {
      throw new Error(`${this.str()}: missing limit`)
    }
    this.limit = Math.min(this.config.limit, MAX_NUM_REWARDS_PER_RULE)

    if (this.config.reward) {
      const value = {
        amount: this.config.reward.amount,
        currency: this.config.reward.currency
      }
      this.reward = new Reward(this.campaignId, this.levelId, this.id, value)
    } else {
      this.reward = null
    }
  }

  str() {
    return `Campaign ${this.campaignId} / Rule ${this.ruleId} / Level ${
      this.levelId
    }`
  }

  /**
   * Calculates if the user qualifies for the next level.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {boolean|null} - Null indicates the rule does not participate in
   *   the condition to qualify for next level.
   */
  qualifyForNextLevel(ethAddress, events) {
    // If the rule is not part of the next level condition, return right away.
    if (!this.config.nextLevelCondition) {
      return null
    }

    // Evaluate the rule based on events.
    return this.evaluate(ethAddress, events)
  }

  /**
   * Counts events, grouped by types.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {Dict{string:number}} - Dict with event type as key and count as value.
   */
  _tallyEvents(ethAddress, eventTypes, events) {
    const tally = {}
    events
      .filter(event => {
        return (
          event.ethAddress === ethAddress &&
          eventTypes.includes(event.type) &&
          (event.status === GrowthEventStatuses.Logged ||
            event.status === GrowthEventStatuses.Verified)
        )
      })
      .forEach(event => {
        tally[event.type] = tally.hasOwnProperty(event.type)
          ? tally[event.type] + 1
          : 1
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

/**
 * A rule that requires 1 event.
 */
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

  /**
   * Returns number of rewards user qualifies for, taking into account the rule's limit.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {number}
   * @private
   */
  _numRewards(ethAddress, events) {
    const tally = this._tallyEvents(ethAddress, this.eventTypes, events)
    // SingleEventRule has at most 1 event in tally count.
    return Object.keys(tally).length == 1
      ? Math.min(Object.values(tally)[0], this.limit)
      : 0
  }

  /**
   * Calculates if the rule passes.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {boolean}
   */
  evaluate(ethAddress, events) {
    const tally = this._tallyEvents(ethAddress, this.eventTypes, events)
    return Object.keys(tally).length === 1 && Object.values(tally)[0] > 0
  }
}

/**
 * A rule that requires N events out of a list of event types.
 *
 * Important: Rule evaluation considers events since user joined the platform
 * but reward calculation only considers events that occurred during the campaign period.
 * As a result, a rule may pass but no reward be granted. As an example:
 *   - assume numEventsRequired = 3
 *   - events E1, E2 occur during campaign C1
 *   - event E3 occurs during campaign C2
 *   => rule passes in campaign C2 but NO reward is granted.
 */
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

    if (
      !this.config.numEventsRequired ||
      !Number.isInteger(this.config.numEventsRequired) ||
      this.config.numEventsRequired > this.eventTypes.length
    ) {
      throw new Error(`${this.str()}: missing or invalid numEventsRequired`)
    }
    this.numEventsRequired = this.config.numEventsRequired
  }

  /**
   * Returns number of rewards user qualifies for, taking into account the rule's limit.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {number}
   * @private
   */
  _numRewards(ethAddress, events) {
    // Attempts to picks N different events from the tally.
    // Returns true if success, false otherwise.
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
    while (numRewards < this.limit && pickN(tally, this.numEventsRequired)) {
      numRewards++
    }
    return numRewards
  }

  /**
   * Calculates if the rule passes.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {boolean}
   */
  evaluate(ethAddress, events) {
    const tally = this._tallyEvents(ethAddress, this.eventTypes, events)
    return Object.keys(tally).length >= this.numEventsRequired
  }
}

module.exports = {
  Campaign
}
