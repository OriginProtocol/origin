const logger = require('../logger')

class FraudEngine {
  async init() {
    logger.info('Dev FraudEngine initialization...')
  }

  /**
   * Runs the fraud engine to determine if a participant should
   * be banned from the Origin Rewards program.
   * Returns an object with a type and reasons field
   *
   * @param {string} ethAddress
   * @returns {Promise<{type: string, reasons: Array<string>>} || null>}
   */
  async shouldBanParticipant(ethAddress) {
    logger.debug(`FraudEngine: analyzing account ${ethAddress}`)
    return null
  }

  /**
   * Runs the fraud engine on an event to determine if it is Fraud or not.
   * If fraud, returns an object with type and reasons field.
   *
   * @param {models.GrowthParticipant} participant
   * @param {models.GrowthEvent} event
   * @returns {Promise<{type: string, reasons: string} || null>}
   */
  async isFraudEvent(participant, event) {
    logger.debug(`FraudEngine: analyzing event ${event.id}`)
    return null
  }
}

module.exports = FraudEngine
