const logger = require('../../logger')

class RiskEngine {
  constructor() {
    logger.info('DEV RiskEngine initialized')
  }

  /**
   * Evaluate fraud risks and returns true if transaction should be accepted. False otherwise.
   *
   * @param {string} from - Eth address of the sender
   * @param {string} txData - Transaction data
   * @param {string} to - Eth address of target contract
   * @param {string} proxy - Optional. Address of the IdentityProxy
   * @returns {Promise<boolean>}
   * @private
   */
  async acceptTx(from, txData, to, proxy) {
    // TODO: implement fraud logic.
    logger.debug('RiskEngine.acceptTx called with args:', {
      from,
      txData,
      to,
      proxy
    })
    return true
  }
}

module.exports = RiskEngine
