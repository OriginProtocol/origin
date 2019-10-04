const {
  GrowthEventTypes,
  GrowthEventStatuses,
  GrowthActionStatus
} = require('../../enums')
const { Reward } = require('./reward')

// System cap for max number of rewards per rule.
const maxNumRewardsPerRule = 1000

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

  async getEarnedRewards(ethAddress, events) {
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

    const additionalRules = this.crules.allRules
      .filter(rule => (this.config.additionalLockConditions || []).includes(rule.id))

    const checkForConditions = (rules, nextLevelConditionCheck) => {
      for (const rule of rules) {
        if (nextLevelConditionCheck && !rule.config.nextLevelCondition) {
          continue
        }

        const ruleConditions = (rule.config.unlockConditionMsg || []).map(c => {
          return {
            messageKey: c.conditionTranslateKey,
            iconSource: c.conditionIcon
          }
        })
        conditions.push(...ruleConditions)
      }
    }

    checkForConditions(this.crules.levels[prevLevel].rules, true)
    checkForConditions(additionalRules, false)

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
      // Reward associated with the rule. Call the rule's custom reward function if it exists.
      reward: this.getReward
        ? await this.getReward(omitUserData ? null : ethAddress)
        : this.reward,
      // Rewards earned by the user.
      rewards: omitUserData
        ? []
        : await this.getEarnedRewards(ethAddress, events),
      unlockConditions: this.conditionsToUnlock(),
      // Fields specific to the ListingIdPurchased rule.
      listingId: this.listingId,
      iconSrc: this.iconSrc,
      titleKey: this.titleKey,
      detailsKey: this.detailsKey,
      // Fields specific to the SocialShare rule
      content: this.content
    }
    return adapter.process(data)
  }
}

module.exports = { BaseRule }
