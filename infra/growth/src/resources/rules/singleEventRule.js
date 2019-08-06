const { BaseRule } = require('./baseRule')

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

module.exports = { SingleEventRule }