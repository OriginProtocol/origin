const { BaseRule } = require('./baseRule')

// TODO this needs to be replaced
const VALID_CODES = process.env.PARTNER_CODES ? process.env.PARTNER_CODES.split(',') : []

/**
 * A rule that checks on a PartnerReferral event type.
 */
class PartnerReferralEvent extends BaseRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)
    if (this.config.eventType) {
      this.addEventType(this.config.eventType)
    }
  }

  /**
   * Returns number of rewards user qualifies for, taking into account the rule's limit.
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
      customId => VALID_CODES.includes(customId)
    )
    return (tally && tally > 0) ? 1 : 0
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
      customId => VALID_CODES.includes(customId)
    )
    return Object.keys(tally).length > 0 && Object.values(tally)[0] > 0
  }
}

module.exports = { PartnerReferralEvent }
