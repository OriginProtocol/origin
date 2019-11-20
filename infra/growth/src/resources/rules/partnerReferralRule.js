const fetch = require('cross-fetch')
const { BaseRule } = require('./baseRule')
const { Reward } = require('./reward')
const logger = require('../../logger')
const { tokenToNaturalUnits } = require('../../util/token')

const PARTNER_CONF_URL = process.env.PARTNER_CONF_URL || 'https://originprotocol.com/static/partnerconf'
// TODO: Does this data need to be refetched/expire or is restart enough?
const PARTNER_REWARDS = {}

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
  }

  /**
   * Returns number of rewards user qualifies for, taking into account the rule's limit.
   * @param {string} ethAddress - User's account.
   * @param {Array<models.GrowthEvent>} events
   * @returns {number}
   * @private
   */
  async _numRewards(ethAddress, events) {
    if (this.validCodes.length < 1) await this._getConfig()
    const tally = this._tallyEvents(
      ethAddress,
      this.eventTypes,
      events,
      customId => this.validCodes.includes(customId)
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
    if (this.validCodes.length < 1) await this._getConfig()
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
      throw new Error('Failed to fetch campaigns JSON')
    }
    const config = await res.json()

    if (!config) {
      return
    }

    this.validCodes = Object.keys(config)

    if (this.validCodes.length === 0) {
      return
    }

    // Get the rewards for the code
    for (const code of this.validCodes) {
      const conf = config[code]
      if (!conf) {
        logger.debug(`Code "${code}" has no config`)
        continue
      }
      PARTNER_REWARDS[code] = conf.reward
    }
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
     */
    return new Reward(this.campaignId, this.levelId, this.id, {
      amount: tokenToNaturalUnits(1000),
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
    if (this.validCodes.length < 1) await this._getConfig()

    const zero = new Reward(this.campaignId, this.levelId, this.id, {
      amount: '0',
      currency: this.config.reward.currency
    })

    // No user passed. Return zero.
    if (!ethAddress || this.validCodes.length < 1) {
      logger.debug(`No address or codes`)
      return zero
    }

    // no events
    if (!events || events.length === 0) {
      logger.debug(`No matching events for ${ethAddress}`)
      return zero
    }

    logger.debug(`Found ${events.length} matching events for ${ethAddress}`)

    const rewards = []
    const seenCodes = []

    /**
     * User can ear multiple partner rewards, but only one from an individual
     * partner.  Make sure to de-dupe as this could happen multiple times.
     */
    events.forEach(ev => {
      if (ev.type !== 'PartnerReferral' || !PARTNER_REWARDS[ev.customId]) return

      if (PARTNER_REWARDS[ev.customId].currency === 'ogn') {
        if (PARTNER_REWARDS[ev.customId] && !seenCodes.includes(ev.customId)) {
          const amount = tokenToNaturalUnits(PARTNER_REWARDS[ev.customId].value)

          logger.debug(`Rewarding ${amount} to ${ethAddress}`)

          rewards.push(new Reward(this.campaignId, this.levelId, this.id, {
            amount,
            currency: this.config.reward.currency
          }))

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
}

module.exports = { PartnerReferralEvent }
