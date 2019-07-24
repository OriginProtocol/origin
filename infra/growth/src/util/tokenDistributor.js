// A helper class to send OGN.
// Used by the payout pipeline.

const BigNumber = require('bignumber.js')
const Logger = require('logplease')

const Token = require('@origin/token/src/token')
const { createProvider } = require('@origin/token/src/config')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('tokenDistributor')

// Number of block confirmations required for a transfer to be consider completed.
const NumBlockConfirmation = 3

// Wait up to 10min for a transaction to get confirmed
const ConfirmationTimeout = 600

class TokenDistributor {
  // Note: we can't use a constructor due to the async call to defaultAccount.
  async init(networkId, gasPriceMultiplier) {
    this.networkId = networkId
    this.gasPriceMultiplier = gasPriceMultiplier
    this.token = new Token(networkId, createProvider(networkId))
    this.supplier = await this.token.defaultAccount(networkId)

    await this.info()
  }

  /**
   * Prints out info about the distributor.
   * @returns {Promise<void>}
   */
  async info() {
    const balance = await this.token.balance(this.supplier)

    logger.info('TokenDistributor:')
    logger.info(`  Network id: ${this.networkId}`)
    logger.info(`  Provider URL: ${this.token.web3.currentProvider.host}`)
    logger.info(`  Address: ${this.supplier}`)
    logger.info(`  Balance: ${this.token.toTokenUnit(balance)} OGN`)
    logger.info(`  Gas price multiplier: ${this.gasPriceMultiplier}`)
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
    return BigNumber(medianGasPrice)
  }

  /**
   * Sends OGN to a user. Throws an exception in case of error.
   *
   * @param {string} ethAddress
   * @param {string} amount in natural units.
   * @returns {Promise<Object>} The transaction receipt.
   */
  async credit(ethAddress, amount) {
    const gasPrice = await this._calcGasPrice()
    const txHash = await this.token.credit(ethAddress, amount, {
      gasPrice
    })
    logger.info(`Sent tx to network. txHash=${txHash}`)

    const { txStatus, receipt } = await this.token.waitForTxConfirmation(
      txHash,
      { numBlocks: NumBlockConfirmation, timeoutSec: ConfirmationTimeout }
    )
    if (txStatus !== 'confirmed') {
      throw new Error(`Failure. txStatus=${txStatus} txHash=${txHash}`)
    }
    logger.info('Blockchain transaction confirmed')
    logger.info('  NetworkId:        ', this.networkId)
    logger.info('  GasMultiplier:    ', this.gasPriceMultiplier)
    logger.info('  GasPrice:         ', gasPrice.toFixed())
    logger.info('  Amount (natural): ', amount)
    logger.info('  Amount (tokens):  ', this.token.toTokenUnit(amount))
    logger.info('  From:             ', this.supplier)
    logger.info('  To:               ', ethAddress)
    logger.info('  TxHash:           ', receipt.transactionHash)
    logger.info('  BlockNumber:      ', receipt.blockNumber)
    return receipt
  }
}

module.exports = TokenDistributor
