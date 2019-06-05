const logger = require('../../logger')

class RiskEngine {
  constructor() {
    logger.info('DEV RiskEngine initialized')
  }

  /**
   * Evaluate fraud risks and returns true if transaction should be accepted. False otherwise.
   *
   * @param {string} from - Eth address of the sender
   * @param {string} to - Eth address of target contract
   * @param {string} txData - Transaction data
   * @param {string} ip - IP address of the request
   * @param {{countryCode: string, countryName: string}} geo
   * @returns {Promise<boolean>}
   * @private
   */
  async acceptTx(from, to, txData, ip, geo) {
    logger.debug('RiskEngine.acceptTx called with args:', {
      from,
      to,
      txData,
      ip,
      geo
    })
    return true
  }
}

module.exports = RiskEngine
