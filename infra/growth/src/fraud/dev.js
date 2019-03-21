const logger = require('../logger')

class FraudEngine {
  async init() {
    logger.info('Dev FraudEngine initialization.')
  }

  /**
   * Returns true if account is deemed fraudulent. False otherwise.
   *
   * @param event
   * @returns {Promise<Boolean>}
   */
  async isFraudAccount(ethAddress) {
    logger.debug(`isFraudAccount ${ethAddress}`)
    return false
  }

  /**
   * Returns true if event is deemed fraudulent. False otherwise.
   *
   * @param event
   * @returns {Promise<Boolean>}
   */
  async isFraudEvent(event) {
    logger.debug(`isFraudEvent ${event.id}`)
    return false
  }
}

module.exports = FraudEngine
