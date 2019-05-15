// A helper class to send OGN.
// Used by the payout pipeline.

const BigNumber = require('bignumber.js')
const Logger = require('logplease')

const Token = require('@origin/token/src/token')
const { createProviders } = require('@origin/token/src/config')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('tokenDistributor')

class TokenDistributor {
  // Note: we can't use a constructor due to the async call to defaultAccount.
  async init(networkId, gasPriceMultiplier) {
    this.networkId = networkId
    this.gasPriceMultiplier = gasPriceMultiplier
    this.token = new Token({ providers: createProviders([networkId]) })
    this.supplier = await this.token.defaultAccount(networkId)
    this.web3 = this.token.web3(networkId)
  }

  /**
   * Calculates gas price to use for sending transactions, by applying an
   * optional gasPriceMultiplier against the current median gas price
   * fetched from the network.
   *
   * @returns {Promise<{BigNumber}>} Gas price to use.
   */
  async _calcGasPrice() {
    // Get default gas price from web3 which is determined by the
    // last few blocks median gas price.
    const web3 = this.token.web3(this.networkId)
    const medianGasPrice = await web3.eth.getGasPrice()

    if (this.gasPriceMultiplier) {
      // Apply our ratio.
      const gasPrice = BigNumber(medianGasPrice).times(this.gasPriceMultiplier)
      return gasPrice.integerValue()
    }
    return medianGasPrice
  }

  /**
   * Sends OGN to a user
   *
   * @param {string} ethAddress
   * @param {string} amount in natural units.
   * @returns {Promise<Object>} The transaction receipt.
   */
  async credit(ethAddress, amount) {
    const gasPrice = await this._calcGasPrice()
    const txnReceipt = await this.token.credit(
      this.networkId,
      ethAddress,
      amount,
      { gasPrice }
    )
    logger.info('Blockchain transaction')
    logger.info('  NetworkId:        ', this.networkId)
    logger.info('  GasMultiplier:    ', this.gasPriceMultiplier)
    logger.info('  GasPrice:         ', gasPrice.toFixed())
    logger.info('  Amount (natural): ', amount)
    logger.info('  Amount (tokens):  ', this.token.toTokenUnit(amount))
    logger.info('  From:             ', this.supplier)
    logger.info('  To:               ', ethAddress)
    logger.info('  TxnHash:          ', txnReceipt.transactionHash)
    logger.info('  BlockNumber:      ', txnReceipt.blockNumber)
    return txnReceipt
  }
}

module.exports = TokenDistributor
