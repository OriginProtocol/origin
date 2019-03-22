const Sequelize = require('sequelize')

const db = require('../models')
const {
  GrowthEventTypes,
  GrowthEventStatuses,
  GrowthCampaignStatuses,
  GrowthActionStatus
} = require('../enums')
const logger = require('../logger')

// System cap for max number of rewards per rule.
const maxNumRewardsPerRule = 1000

class Reward {
  constructor(campaignId, levelId, ruleId, value) {
    this.campaignId = campaignId
    this.levelId = levelId
    this.ruleId = ruleId
    this.value = value // <{amount: string, currency: string}>
  }
}

class ReferralReward extends Reward {
  constructor(campaignId, levelId, ruleId, value, referee) {
    super(campaignId, levelId, ruleId, value)
    this.refereeEthAddress = referee
  }
}

class CampaignRules {
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
      this.levels[i] = new Level(this, i, this.config.levels[i])
    }
  }

  /**
   * Returns the value of the referral reward, if any, defined in the campaign
   * @returns {{amount: string, currency: string}||null}
   */
  getReferralRewardValue() {
    // Go thru each rule and check if it is of type Referral.
    for (let i = 0; i < this.config.numLevels; i++) {
      for (const rule of this.levels[i].rules) {
        if (rule.constructor.name === 'ReferralRule') {
          return rule.rewardValue
        }
      }
    }
    return null
  }

  /**
   * Reads events related to a user from the DB.
   * @param {string} ethAddress - User's account.
   * @param {Object} Options:
   *   - duringCampaign - Restricts query to events that occurred during
   *  the campaign. By default all events since user signed up are returned.
   *   - beforeCampaign - Restricts query to events that occurred prior to the
   *   campaign start. By default all events since user signed up are returned.
   *   - onlyVerified - Only returns events with status Verified.
   *   By default returns events with status Verified or Logged.
   * @returns {Promise<Array<models.GrowthEvent>>}
   */
  async getEvents(ethAddress, opts = {}) {
    if (opts.beforeCampaign && opts.duringCampaign) {
      throw new Error('beforeCampaign and duringCampaign args are incompatible')
    }
    const whereClause = {
      ethAddress: ethAddress.toLowerCase()
    }

    const endDate = opts.beforeCampaign
      ? this.campaign.startDate
      : this.campaign.capReachedDate || this.campaign.endDate
    if (opts.duringCampaign) {
      whereClause.createdAt = {
        [Sequelize.Op.gte]: this.campaign.startDate,
        [Sequelize.Op.lt]: endDate
      }
    } else {
      whereClause.createdAt = {
        [Sequelize.Op.lt]: endDate
      }
    }

    if (opts.onlyVerified) {
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
   * Helper method to calculate level based on a set of events.
   * @param {string} ethAddress
   * @param {Array<models.GrowthEvent>} events
   * @returns {number}
   * @private
   */
  async _calculateLevel(ethAddress, events) {
    let level
    for (level = 0; level < this.config.numLevels - 1; level++) {
      const qualify = await this.levels[level].qualifyForNextLevel(
        ethAddress,
        events
      )
      if (!qualify) {
        break
      }
    }
    return level
  }

  /**
   * Returns the user level.
   * Considers events that occurred until the campaign ended.
   *
   * @param {string} ethAddress - User's account.
   * @param {boolean} onlyVerifiedEvents - If true, only uses events with
   *  status Verified for the calculation. By default uses events with
   *  status Verified or Logged.
   * @returns {Promise<number>}
   */
  async getCurrentLevel(ethAddress, onlyVerifiedEvents = false) {
    const events = await this.getEvents(ethAddress, { onlyVerifiedEvents })
    return await this._calculateLevel(ethAddress, events)
  }

  /**
   * Returns the user level prior to the campaign starting.
   *
   * @param ethAddress
   * @returns {Promise<number>}
   */
  async getPriorLevel(ethAddress) {
    const events = await this.getEvents(ethAddress, { beforeCampaign: true })
    return await this._calculateLevel(ethAddress, events)
  }

  /**
   * Calculates rewards earned by the user.
   * Only considers events that occurred during the campaign.
   *
   * @param {string} ethAddress - User's account.
   * @param {boolean} onlyVerifiedEvents - Only use events with status Verified
   *   for the calculation. By default uses events with status Verified or Logged.
   * @returns {Promise<Array<Reward>>} - List of rewards, in no specific order.
   */
  async getRewards(ethAddress, onlyVerifiedEvents = false) {
    const rewards = []
    const events = await this.getEvents(ethAddress, {
      duringCampaign: true,
      onlyVerifiedEvents
    })
    const currentLevel = await this.getCurrentLevel(
      ethAddress,
      onlyVerifiedEvents
    )
    for (let i = 0; i <= currentLevel; i++) {
      const levelRewards = await this.levels[i].getRewards(ethAddress, events)
      rewards.push(...levelRewards)
    }
    return rewards
  }

  /**
   * Returns campaign status
   *
   * @returns {Enum<GrowthCampaignStatuses>} - campaign status
   */
  getStatus() {
    const now = new Date()
    if (this.campaign.startDate > now) {
      return GrowthCampaignStatuses.Pending
    } else if (this.campaign.startDate < now && this.campaign.endDate > now) {
      //TODO: check if cap reached
      return GrowthCampaignStatuses.Active
    } else if (this.campaign.endDate < now) {
      return GrowthCampaignStatuses.Completed
    }
    throw new Error(`Unexpected status for campaign id:${this.campaign.id}`)
  }
}

class Level {
  constructor(crules, levelId, config) {
    this.crules = crules
    this.campaignId = crules.campaign.id
    this.id = levelId
    this.config = config

    this.rules = config.rules.map(ruleConfig =>
      ruleFactory(crules, levelId, ruleConfig)
    )
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

  async getRewards(ethAddress, events) {
    const rewards = []
    for (const rule of this.rules) {
      const ruleRewards = await rule.getRewards(ethAddress, events)
      rewards.push(...ruleRewards)
    }

    return rewards
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
    default:
      throw new Error(`Unexpected or missing rule class ${config.class}`)
  }
  return rule
}

class BaseRule {
  constructor(crules, levelId, config) {
    this.crules = crules
    this.campaign = crules.campaign
    this.campaignId = crules.campaign.id
    this.levelId = levelId
    this.id = config.id
    this.config = config.config

    if (this.config.reward && !this.config.limit) {
      throw new Error(`${this.str()}: missing limit`)
    }
    if (this.config.visible === undefined) {
      throw new Error(`Missing 'visible' property`)
    }
    if (this.config.repeatable === undefined) {
      throw new Error(`Missing 'repeatable' property`)
    }
    if (
      this.config.nextLevelCondition === true &&
      (!this.config.unlockConditionMsg ||
        this.config.unlockConditionMsg.length === 0)
    ) {
      throw new Error('Missing unlock condition configuration.')
    }
    this.limit = this.config.limit
    if (this.limit > maxNumRewardsPerRule) {
      throw new Error(`Rule limit of ${this.config.limit} exceeds max allowed.`)
    }

    if (this.config.reward) {
      this.rewardValue = {
        amount: this.config.reward.amount,
        currency: this.config.reward.currency
      }
      this.reward = new Reward(
        this.campaignId,
        this.levelId,
        this.id,
        this.rewardValue
      )
    } else {
      this.rewardValue = null
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
  async qualifyForNextLevel(ethAddress, events) {
    // If the rule is not part of the next level condition, return right away.
    if (!this.config.nextLevelCondition) {
      return null
    }

    // Evaluate the rule based on events.
    return await this.evaluate(ethAddress, events)
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
          event.ethAddress.toLowerCase() === ethAddress.toLowerCase() &&
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

  async getRewards(ethAddress, events) {
    // If this rule does not give out reward, return right away.
    if (!this.reward) {
      return []
    }

    const numRewards = this._numRewards(ethAddress, events)
    const rewards = Array(numRewards).fill(this.reward)

    return rewards
  }

  /**
   * Rules that are not visible are required for backend logic. The visible ones
   * are displayed in the UI
   *
   * @returns {boolean}
   */
  isVisible() {
    return this.config.visible
  }

  /**
   * Return the rule's status. One of: Inactive, Active, Completed.
   *  - Inactive: rule is locked
   *  - Active: user can actively earn rewards with the rule
   *  - Completed: user earned all the possible rewards (if any) for the rule.
   *
   * @param {string} ethAddress - User's eth address
   * @param {Array<models.GrowthEvent>} allEvents - All events for user since sign up.
   * @param {number} currentUserLevel - Current level the user is at in the campaign.
   * @returns {Promise<enums.GrowthActionStatus>}
   */
  async getStatus(ethAddress, allEvents, currentUserLevel) {
    // If the user hasn't reached the level the rule is in, status is Inactive.
    if (currentUserLevel < this.levelId) {
      return GrowthActionStatus.Inactive
    }
    // If there is no reward associated with the rule, status is Completed.
    if (!this.reward) {
      return GrowthActionStatus.Completed
    }

    // Determine if the rule is Completed by calculating if all rewards
    // have been earned.
    // - For a repeatable rule, we only consider events during the campaign.
    // As an example, ListingPurchase is repeatable: user gets rewarded
    // for repeating purchase actions every campaign.
    // - For a non-repeatable rule, we consider all events since user signed up
    // since the rule can be completed only once. For example attestations is
    // non-repeatable: user completes it and gets rewarded only once.
    let events = allEvents
    if (this.config.repeatable) {
      events = allEvents.filter(e => (e.createdAt >= this.campaign.startDate && e.createdAt <= this.campaign.endDate))
    }
    const numRewards = await this.getRewards(ethAddress, events)
    logger.error("RULE ", this.id, " numRewards=", numRewards.length)
    return (numRewards.length < this.limit) ? GrowthActionStatus.Active : GrowthActionStatus.Completed
  }
}

/**
 * A rule that requires 1 event.
 */
class SingleEventRule extends BaseRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)

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
    return Object.keys(tally).length === 1
      ? Math.min(Object.values(tally)[0], this.limit)
      : 0
  }

  /**
   * Returns true if the rule passes, false otherwise.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {boolean}
   */
  async evaluate(ethAddress, events) {
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
  constructor(crules, levelId, config) {
    super(crules, levelId, config)

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
  async evaluate(ethAddress, events) {
    const tally = this._tallyEvents(ethAddress, this.eventTypes, events)
    return Object.keys(tally).length >= this.numEventsRequired
  }
}

/**
 * A rule for rewarding a referrer when their referees reaches a certain level.
 *
 * Note: For the referrer to obtain the reward during a given campaign,
 * the referee must reached the required level during that campaign's window.
 */
class ReferralRule extends BaseRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)

    // Level the referee is required to reach for the referrer to get the reward.
    if (!this.config.levelRequired) {
      throw new Error(`${this.str()}: missing levelRequired field`)
    }
    this.levelRequired = this.config.levelRequired
  }

  /**
   * Return true if the referrer qualifies for at least one referral reward
   * as part of the campaign.
   * Note: this could become configurable if needed in the future. For example
   * to require N rewards.
   * @param {string} ethAddress - Referrer's account.
   * @returns {boolean}
   */
  async evaluate(ethAddress) {
    return (await this.getRewards(ethAddress).length) > 0
  }

  /**
   * Returns list of address of referees for a referrer.
   * @param {string} referrer - Referrer's eth address.
   * @returns {Promise<Array<string>>}
   * @private
   */
  async _getReferees(referrer) {
    const invites = await db.GrowthReferral.findAll({
      where: {
        referrerEthAddress: referrer,
        createdAt: { [Sequelize.Op.lte]: this.campaign.endDate }
      }
    })
    return invites.map(i => i.refereeEthAddress)
  }

  /**
   * Calculates referral rewards:
   *  - load list of referee's of the referrer
   *  - for each referee, check they are at required level and that level
   *  was reaching during this campaign.
   * @param {string} ethAddress - Referrer's account.
   * @returns {Array<ReferralReward>}
   */
  async getRewards(ethAddress) {
    // If this rule does not give out reward, return right away.
    if (!this.reward) {
      return []
    }

    const rewards = []

    // Go thru each referee and check if they meet the referral reward conditions.
    const referees = await this._getReferees(ethAddress)
    for (const referee of referees) {
      // Check the referee is at or above required level.
      const refereeLevel = await this.crules.getCurrentLevel(referee)

      if (refereeLevel < this.levelRequired) {
        logger.debug(
          `Referee ${referee} does not meet level requirement. skipping.`
        )
        continue
      }

      // Check the referee reached the level during this campaign as opposed
      // to prior to the campaign.
      const refereePriorLevel = await this.crules.getPriorLevel(referee)
      if (refereePriorLevel >= this.levelRequired) {
        logger.debug(
          `Referee ${referee} reached level prior to campaign start. skipping`
        )
        continue
      }

      // Referral is valid. Referrer should get a reward for it.
      logger.debug(
        `Referrer ${ethAddress} gets credit for referring ${referee}`
      )
      const reward = new ReferralReward(
        this.campaignId,
        this.levelId,
        this.id,
        this.rewardValue,
        referee
      )
      rewards.push(reward)
    }

    return rewards
  }
}

module.exports = { CampaignRules }
