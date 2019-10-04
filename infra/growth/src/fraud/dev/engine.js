const logger = require('../../logger')

class FraudEngine {
  async init() {
    logger.info('Dev FraudEngine initialization...')
  }

  /**
   * Check if the growth participant account is a duplicate of another
   * active participant account.
   * If yes returns type and reasons, null otherwise.
   *
   * @param {string} ethAddress
   * @returns {Promise<{type: string, reasons: Array<string>} || null>}
   */
  async isDupeParticipantAccount(ethAddress) {
    logger.debug(`FraudEngine: dupe analysis for account ${ethAddress}`)
    return null
  }

  /**
   * Check if account is a fraudulent referrer.
   * If yes returns type and reasons, null otherwise.
   *
   * @param {string} ethAddress
   * @returns {Promise<{type: string, reasons: Array<string>} || null>}
   */
  async isFraudReferrerAccount(ethAddress) {
    logger.debug(`FraudEngine: referrer analysis for account ${ethAddress}`)
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
