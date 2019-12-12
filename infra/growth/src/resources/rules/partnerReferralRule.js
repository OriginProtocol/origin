const fetch = require('cross-fetch')
const { BaseRule } = require('./baseRule')
const { Reward } = require('./reward')
const logger = require('../../logger')
const { tokenToNaturalUnits } = require('../../util/token')
const { GrowthActionStatus } = require('../../enums')

const CONF_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const PARTNER_CONF_URL =
  process.env.PARTNER_CONF_URL ||
  'https://originprotocol.com/static/partnerconf'
let PARTNER_REWARDS = {}
let PARTNER_NAMES = {}

/**
 * A rule that checks on a PartnerReferral event type.
 */
class PartnerReferralEvent extends BaseRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)

    if (this.config.eventType) {
      this.addEventType(this.config.eventType)
    }

    this.validCodes = []
    this.lastConfLoad = null
  }

  /**
   * Return whether or not the configuration should be reloaded from source
   */
  async _reloadConf() {
    if (
      this.validCodes.length < 1 ||
      (this.lastConfLoad &&
        +new Date() - CONF_CACHE_DURATION > Number(this.lastConfLoad))
    ) {
      await this._getConfig()
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
    await this._reloadConf()
    const tally = this._tallyEvents(
      ethAddress,
      this.eventTypes,
      events,
      customId => this.validCodes.includes(customId)
    )
    return tally && tally.PartnerReferral > 0 ? 1 : 0
  }

  /**
   * Returns true if the rule passes, false otherwise.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {boolean}
   */
  async _evaluate(ethAddress, events) {
    await this._reloadConf()
    const tally = this._tallyEvents(
      ethAddress,
      this.eventTypes,
      events,
      customId => this.validCodes.includes(customId)
    )
    return Object.keys(tally).length > 0 && Object.values(tally)[0] > 0
  }

  /**
   * Retrieve all campaign configuration
   */
  async _getConfig() {
    const url = `${PARTNER_CONF_URL}/campaigns.json`
    const res = await fetch(url)
    if (res.status !== 200) {
      logger.error('Failed to fetch campaigns JSON')
      return
    }
    const config = await res.json()

    if (!config) {
      logger.error('No config - probably an error')
      return
    }

    this.validCodes = Object.keys(config)

    if (this.validCodes.length === 0) {
      logger.warn('Found 0 valid codes from campaigns.json')
      return
    }

    PARTNER_NAMES = {}
    PARTNER_REWARDS = {}

    // Get the rewards for the code
    for (const code of this.validCodes) {
      const conf = config[code]
      if (!conf) {
        logger.debug(`Code "${code}" has no config`)
        continue
      }
      PARTNER_REWARDS[code] = conf.reward
      PARTNER_NAMES[code] = conf.partner ? conf.partner.name : null
    }

    this.lastConfLoad = new Date()
    logger.info(
      `Loaded campaigns.json config at ${this.lastConfLoad.toString()}`
    )
  }

  /**
   * Calculate potential reward
   * @param {string} ethAddress
   * @param {Object} identityForTest - For testing only.
   * @returns {Promise<Reward>}
   */
  async getReward() {
    /**
     * TODO: This isn't exactly a fixed amount, but most likely one user won't
     * earn more than one reward of 1000 OGN. Needs massaging?
     *
     * Note from @franckc: "potential" reward will not be shown to the user on
     * the UI (since the reward only shows up AFTER the user completed the
     * action), so the value does not matter.
     */
    return new Reward(this.campaignId, this.levelId, this.id, {
      amount: '0',
      currency: this.config.reward.currency
    })
  }

  /**
   * Compute a personalized reward amount earned based on referral codes we've
   * seen in PartnerReferral events
   *
   * @param ethAddress
   * @param events
   * @returns {Promise<Array<Reward>>}
   */
  async getEarnedRewards(ethAddress, events) {
    await this._reloadConf()

    const zero = new Reward(this.campaignId, this.levelId, this.id, {
      amount: '0',
      currency: this.config.reward.currency
    })

    // No user passed. Return zero.
    if (!ethAddress || this.validCodes.length < 1) {
      logger.debug(`No address or codes`)
      return [zero]
    }

    // no events
    if (!events || events.length === 0) {
      logger.debug(`No matching events for ${ethAddress}`)
      return [zero]
    }

    logger.debug(`Found ${events.length} matching events for ${ethAddress}`)

    const rewards = []
    const seenCodes = []

    /**
     * User can earn multiple partner rewards, but only one from an individual
     * partner.  Make sure to de-dupe as this could happen multiple times.
     */
    events.forEach(ev => {
      if (ev.type !== 'PartnerReferral' || !PARTNER_REWARDS[ev.customId]) return

      this.conditionalName = `${PARTNER_NAMES[ev.customId]} Referral`

      if (PARTNER_REWARDS[ev.customId].currency.toLowerCase() === 'ogn') {
        if (PARTNER_REWARDS[ev.customId] && !seenCodes.includes(ev.customId)) {
          const amount = tokenToNaturalUnits(PARTNER_REWARDS[ev.customId].value)

          logger.debug(`Rewarding ${amount} to ${ethAddress}`)

          rewards.push(
            new Reward(this.campaignId, this.levelId, this.id, {
              amount,
              currency: this.config.reward.currency
            })
          )

          // Only one per code
          seenCodes.push(ev.customId)
        } else {
          logger.warn('Unrecognized code')
        }
      } else {
        logger.error("Configured reward is not OGN and I don't know what to do")
      }
    })

    return rewards
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
    if (
      currentUserLevel < this.levelId &&
      (await this._evaluate(ethAddress, events))
    ) {
      return GrowthActionStatus.Inactive
    }
    // TODO: Not exactly accurate, do we need another enum val or does this
    // hack work?
    return GrowthActionStatus.Exhausted
  }
}

module.exports = { PartnerReferralEvent }
