const crypto = require('crypto')
const Sequelize = require('sequelize')

const _growthModels = require('../models')
const _discoveryModels = require('@origin/discovery/src/models')
const db = { ..._growthModels, ..._discoveryModels }

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

    this.allRules = [] // Flat list of rules.
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
   * Events recorded from any of the proxies owned by that wallet are included.
   *
   * @param {string} ethAddress - User's wallet address..
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

    // Load any proxy associated with the wallet address.
    const ownerAddress = ethAddress.toLowerCase()
    const proxies = await db.Proxy.findAll({ where: { ownerAddress } })

    // Query events from wallet and proxy(ies).
    const addresses = [ownerAddress, ...proxies.map(proxy => proxy.address)]
    const whereClause = { ethAddress: { [Sequelize.Op.in]: addresses } }

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
   *
   * @param {string} ethAddress - User's account.
   * @param {boolean} onlyVerifiedEvents - Only use events with status Verified
   *   for the calculation. By default uses events with status Verified or Logged.
   * @returns {Promise<Array<Reward>>} - List of rewards, in no specific order.
   */
  async getRewards(ethAddress, onlyVerifiedEvents = false) {
    const rewards = []
    const events = await this.getEvents(ethAddress, { onlyVerifiedEvents })
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
   * Returns campaign status.
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

  /**
   * Exports the state of the rules for a given user.
   * Walks thru all the rules and calls the adapter with data for each rule.
   *
   * @param {Adapter} adapter - Class to use for formatting the rule data.
   * @param {string} ethAddress - if this parameter is null or undefined growth returns the rules
   *                              without any user specific data
   * @returns {Promise<Array<Object>>} List representing state of each rule.
   */
  async export(adapter, ethAddress) {
    const events = ethAddress ? await this.getEvents(ethAddress) : undefined
    const level = ethAddress
      ? await this._calculateLevel(ethAddress, events)
      : undefined

    const data = []
    for (let i = 0; i < this.numLevels; i++) {
      data.push(
        ...(await this.levels[i].export(adapter, ethAddress, events, level))
      )
    }
    return data
  }
}

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

  async getRewards(ethAddress, events) {
    const rewards = []
    for (const rule of this.rules) {
      const ruleRewards = await rule.getRewards(ethAddress, events)
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
    if (!['user', 'campaign'].includes(this.config.scope)) {
      throw new Error(`Missing or invalid 'scope' for rule: ${this.id}`)
    }
    if (
      this.config.nextLevelCondition === true &&
      (!this.config.unlockConditionMsg ||
        this.config.unlockConditionMsg.length === 0)
    ) {
      throw new Error('Missing unlock condition configuration.')
    }
    if (
      this.config.additionalLockConditions &&
      !Array.isArray(this.config.additionalLockConditions)
    ) {
      throw new Error(
        'Additional lock conditions should be an array of Rule ids'
      )
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

    /**
     * To prevent mistakes we verify that all lockConditions specified in the rule
     * are present in the rules list. This way we prevent lock condition typos
     */
    if (this.config.additionalLockConditions) {
      const ruleIds = this.crules.allRules.map(rule => rule.id)
      const falseConditions = this.config.additionalLockConditions.filter(
        condition => !ruleIds.includes(condition)
      )
      if (falseConditions.length > 0) {
        throw new Error(
          `The following conditions can not be found among the rules: ${falseConditions.join(
            ', '
          )}`
        )
      }
    }
  }

  str() {
    return `Campaign ${this.campaignId} / Rule ${this.ruleId} / Level ${this.levelId}`
  }

  /**
   * Helper function to add an event type to the eventTypes field of a rule.
   * @param eventType
   */
  addEventType(eventType) {
    // Check the eventType is valid.
    if (!GrowthEventTypes.includes(eventType)) {
      throw new Error(`${this.str()}: unknown eventType ${eventType}`)
    }
    // Add it to eventTypes.
    if (!this.eventTypes) {
      this.eventTypes = [eventType]
    } else {
      this.eventTypes.push(eventType)
    }
  }

  /**
   * Returns the set of events to consider when evaluating the rule.
   *
   * @param {Array<models.GrowthEvent>} events - All events related to the user.
   * @returns {Array<models.GrowthEvent>}} Events in scope.
   * @private
   */
  _inScope(events) {
    if (this.config.scope === 'user') {
      return events
    }
    // Scope is 'campaign' - only consider events that occurred during the campaign window.
    return events.filter(
      e =>
        e.createdAt >= this.campaign.startDate &&
        e.createdAt <= this.campaign.endDate
    )
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
    return await this._evaluate(ethAddress, this._inScope(events))
  }

  /**
   * Counts events, grouped by types.
   * @param {string} ethAddress - User's wallet address.
   * @param {Array<models.GrowthEvent>} events
   * @param {function} customIdFn - Optional. Custom id filter function.
   * @returns {Dict{string:number}} - Dict with event type as key and count as value.
   */
  _tallyEvents(ethAddress, eventTypes, events, customIdFn = null) {
    const tally = {}
    events
      .filter(event => {
        return (
          eventTypes.includes(event.type) &&
          (!customIdFn || customIdFn(event.customId)) &&
          (event.status === GrowthEventStatuses.Logged ||
            event.status === GrowthEventStatuses.Verified)
        )
      })
      .forEach(event => {
        tally[event.type] = Object.prototype.hasOwnProperty.call(
          tally,
          event.type
        )
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

    const numRewards = await this._numRewards(ethAddress, this._inScope(events))
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
   * This is for use by the front-end to display the status of the rule to the user.
   *  - Inactive: rule is locked
   *  - Active:
   *     - Rule returning rewards: user can actively earn rewards from the rule
   *     - Rule that is a condition: user has not met condition yet.
   *  - Completed:
   *     - Rule returning rewards: user reached the limit of rewards that can be earned from the rule
   *     - Rule that is a condition: user has met condition.
   *
   * @param {string} ethAddress - User's eth address
   * @param {Array<models.GrowthEvent>} events - All events for user since sign up.
   * @param {number} currentUserLevel - Current level the user is at in the campaign.
   * @returns {Promise<enums.GrowthActionStatus>}
   */
  async getStatus(ethAddress, events, currentUserLevel) {
    // If the user hasn't reached the level the rule is in, status is Inactive.
    if (currentUserLevel < this.levelId) {
      return GrowthActionStatus.Inactive
    }
    // If the rule has additional unlock conditions
    else if (this.config.additionalLockConditions) {
      // all the precondition rules need to have completed state
      const hasNonCompletedPreconditionRule = (await Promise.all(
        this.crules.allRules
          .filter(rule =>
            this.config.additionalLockConditions.includes(rule.id)
          )
          .map(rule => rule.getStatus(ethAddress, events, currentUserLevel))
      )).some(status => status !== 'Completed')

      if (hasNonCompletedPreconditionRule) {
        return GrowthActionStatus.Inactive
      }
    }

    if (this.reward) {
      // Reward rule. Determine if the rule is Completed by calculating
      // if all rewards have been earned.
      // For some rules, there are 2 scopes defined:
      //  1. config.scope should be used for computing earned rewards.
      //  2. config.statusScope should be used for computing the status.
      // This is for the case where if the rule was completed in a prior campaign,
      // then we want to show it as Complete.
      // For example Attestation rules can only be completed once during a campaign and
      // later campaigns should show them as Completed. We can achieve this behavior
      // by setting scope to "campaign" and statusScope to "user".
      const numRewards = await this._numRewards(
        ethAddress,
        this.config.statusScope === 'user' ? events : this._inScope(events)
      )
      return numRewards < this.limit
        ? GrowthActionStatus.Active
        : GrowthActionStatus.Completed
    } else {
      // Evaluate the rule to determine if it is Completed.
      return (await this._evaluate(ethAddress, events))
        ? GrowthActionStatus.Completed
        : GrowthActionStatus.Active
    }
  }

  conditionsToUnlock() {
    const prevLevel = this.levelId - 1
    if (prevLevel < 0) {
      return []
    }
    const conditions = []
    for (const rule of this.crules.levels[prevLevel].rules) {
      if (rule.config.unlockConditionMsg) {
        const ruleConditions = rule.config.unlockConditionMsg.map(c => {
          return {
            messageKey: c.conditionTranslateKey,
            iconSource: c.conditionIcon
          }
        })
        conditions.push(...ruleConditions)
      }
    }
    return conditions
  }

  /**
   * Gathers the state of the rule. Calls the provided adapter to format the data.
   *
   * @param {Adapter} adapter - Class to use for formatting the rule data
   * @param {string} ethAddress
   * @param {Array<models.GrowthEvent>}
   * @param {number} level
   * @returns {Promise<Array<Object>>}
   */
  async export(adapter, ethAddress, events, level) {
    const omitUserData = !ethAddress && !events && !level
    const data = {
      ruleId: this.id,
      ethAddress,
      visible: this.config.visible,
      campaign: this.campaign,
      limit: this.limit,
      status: omitUserData
        ? null
        : await this.getStatus(ethAddress, events, level),
      reward: this.reward,
      rewards: omitUserData ? [] : await this.getRewards(ethAddress, events),
      unlockConditions: this.conditionsToUnlock(),
      // Fields specific to the ListingIdPurchased rule.
      listingId: this.listingId,
      iconSrc: this.iconSrc,
      titleKey: this.titleKey,
      detailsKey: this.detailsKey
    }
    return adapter.process(data)
  }
}

/**
 * A rule that checks on a single event type.
 */
class SingleEventRule extends BaseRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)
    if (this.config.eventType) {
      this.addEventType(this.config.eventType)
    }
  }

  /**
   * Returns number of rewards the user qualifies for, taking into account the rule's limit.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {number}
   * @private
   */
  async _numRewards(ethAddress, events) {
    const tally = this._tallyEvents(
      ethAddress,
      this.eventTypes,
      events,
      // Filter using the customIDFilter function if it is defined.
      this.customIdFilter ? customId => this.customIdFilter(customId) : null
    )
    return Object.keys(tally).length > 0
      ? Math.min(Object.values(tally)[0], this.limit)
      : 0
  }

  /**
   * Returns true if the rule passes, false otherwise.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {boolean}
   */
  async _evaluate(ethAddress, events) {
    const tally = this._tallyEvents(
      ethAddress,
      this.eventTypes,
      events,
      // Filter using the customIDFilter function if it is defined.
      this.customIdFilter ? customId => this.customIdFilter(customId) : null
    )
    return Object.keys(tally).length > 0 && Object.values(tally)[0] > 0
  }
}

/**
 * A rule that requires the purchase of a specific listing.
 */
class ListingIdPurchaseRule extends SingleEventRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)
    if (!this.config.listingId) {
      throw new Error(`${this.str()}: missing listingId field`)
    }
    this.listingId = this.config.listingId
    if (!this.config.iconSrc) {
      throw new Error(`${this.str()}: missing iconSrc field`)
    }
    this.iconSrc = this.config.iconSrc
    if (!this.config.titleKey) {
      throw new Error(`${this.str()}: missing titleKey field`)
    }
    this.titleKey = this.config.titleKey
    if (!this.config.detailsKey) {
      throw new Error(`${this.str()}: missing detailsKey field`)
    }
    this.detailsKey = this.config.detailsKey
    this.addEventType('ListingPurchased')
  }

  /**
   * Filter function to use when calling _tallyEvent.
   * Filters out events that are not for an offer on the listingId of the rule.
   * For ListingPurchased events, customId is the offerId with
   * format <network>-<contract_version>-<listingSeq>-<offerSeq>
   * @param {string} customId
   * @returns {boolean}
   */
  customIdFilter(customId) {
    // Trim the offerId from customId to get the listingId.
    return (
      this.listingId ===
      customId
        .split('-')
        .slice(0, 3)
        .join('-')
    )
  }
}

/**
 * A rule that rewards for sharing content on social networks
 */
class SocialShareRule extends SingleEventRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)
    if (!this.config.contents || !Array.isArray(this.config.contents)) {
      throw new Error(`${this.str()}: missing or non-array contents field`)
    }
    // Compute the hashes for the post content, in all the configured languages.
    this.contentHashes = []
    for (const content of this.config.contents) {
      this.contentHashes.push(this._hashContent(content.post.text.default))
      for (const translation of Object.values(content.post.text.translations)) {
        this.contentHashes.push(this._hashContent(translation))
      }
    }
  }

  /**
   * Hashes content for verification of the user's post purposes.
   *
   * Important: Make sure to keep this hash function in sync with
   * the one used in the bridge server.
   * See infra/bridge/src/promotions.js
   *
   * @param text
   * @returns {string} Hash of the text, hexadecimal encoded.
   * @private
   */
  _hashContent(text) {
    return crypto
      .createHash('md5')
      .update(text)
      .digest('hex')
  }
  /**
   * Returns true if the event's content hash (stored in customId) belongs to the
   * set of hashes configured in the rule.
   * @param {string} customId: hashed content of the post.
   * @returns {boolean}
   */
  customIdFilter(customId) {
    // Check the customId belongs to set of hashes configured in the rule.
    return this.contentHashes.includes(customId)
  }
}

/**
 * A rule that requires N events out of a list of event types.
 *
 */
class MultiEventsRule extends BaseRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)

    if (!this.config.eventTypes) {
      throw new Error(`${this.str()}: missing eventTypes field`)
    }
    this.config.eventTypes.forEach(eventType => this.addEventType(eventType))

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
  async _numRewards(ethAddress, events) {
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
  async _evaluate(ethAddress, events) {
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
  async _evaluate(ethAddress) {
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

    let rewards = []

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

      if (this.config.scope === 'campaign') {
        // Check the referee reached the level during this campaign as opposed
        // to prior to the campaign.
        const refereePriorLevel = await this.crules.getPriorLevel(referee)
        if (refereePriorLevel >= this.levelRequired) {
          logger.debug(
            `Referee ${referee} reached level prior to campaign start. skipping`
          )
          continue
        }
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

    // Enforce rules limit.
    rewards = rewards.slice(0, this.limit)

    return rewards
  }

  async _numRewards(ethAddress) {
    return (await this.getRewards(ethAddress)).length
  }
}

module.exports = { CampaignRules }
