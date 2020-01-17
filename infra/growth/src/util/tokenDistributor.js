// A helper class to send OGN.
// Used by the payout pipeline.

const BigNumber = require('bignumber.js')
const Logger = require('logplease')

const Token = require('@origin/token/src/token')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('tokenDistributor')

// Number of block confirmations required for a transfer to be consider completed.
const NumBlockConfirmation = 3

// Wait up to 10 min for a transaction to get confirmed
const ConfirmationTimeoutSec = 10 * 60

class TokenDistributor {
  // Note: we can't use a constructor due to the async call to defaultAccount.
  async init(networkId, gasPriceMultiplier) {
    this.networkId = networkId
    this.gasPriceMultiplier = gasPriceMultiplier
    this.token = new Token(networkId)
    this.supplier = await this.token.defaultAccount()
    this.web3 = this.token.web3

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
    logger.info(`  Provider URL: ${this.web3.currentProvider.host}`)
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
    const medianGasPrice = await this.web3.eth.getGasPrice()

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
   * @param {BigNumber|int>} amount in natural units.
   * @returns {Promise<Object>} The transaction receipt.
   */
  async credit(ethAddress, amount) {
    const gasPrice = await this._calcGasPrice()
    const txHash = await this.token.credit(ethAddress, amount, {
      gasPrice
    })
    logger.info(`Sent tx to network. txHash=${txHash}`)

    const { status, receipt } = await this.token.waitForTxConfirmation(txHash, {
      numBlocks: NumBlockConfirmation,
      timeoutSec: ConfirmationTimeoutSec
    })
    if (status !== 'confirmed') {
      throw new Error(`Failure. txStatus=${status} txHash=${txHash}`)
    }
    logger.info('Blockchain transaction confirmed')
    logger.info('  NetworkId:        ', this.networkId)
    logger.info('  GasMultiplier:    ', this.gasPriceMultiplier)
    logger.info('  GasPrice:         ', gasPrice.toFixed())
    logger.info('  Amount (natural): ', amount)
    logger.info('  Amount (token):   ', this.token.toTokenUnit(amount))
    logger.info('  From:             ', this.supplier)
    logger.info('  To:               ', ethAddress)
    logger.info('  TxHash:           ', receipt.transactionHash)
    logger.info('  BlockNumber:      ', receipt.blockNumber)
    return receipt
  }

  /**
   * Send OGN to a list of addresses.
   * @param {Array<string>} addresses: list of recipient addresses.
   * @param {Array<BigNumber|int>>} amounts: amount of OGN to distribute to each recipient, in natural unit.
   * @returns {Promise<Object>}
   */
  async creditMulti(addresses, amounts) {
    if (addresses.length !== amounts.length) {
      throw new Error('Addresses and amounts must have the same length')
    }
    const total = amounts.map(v => BigNumber(v)).reduce((v1, v2) => v1.plus(v2))

    const gasPrice = await this._calcGasPrice()

    //
    // Step 1: Send the approval tx and wait for its confirmation.
    //
    const approveTxHash = await this.token.approveMulti(total, { gasPrice })
    logger.info(`Sent approval tx to the network. txHash=${txHash}`)
    const { approveStatus } = await this.token.waitForTxConfirmation(
      approveTxHash,
      {
        numBlocks: NumBlockConfirmation,
        timeoutSec: ConfirmationTimeoutSec
      }
    )
    if (approveStatus !== 'confirmed') {
      throw new Error(
        `Approve failure. txStatus=${approveStatus} txHash=${approveTxHash}`
      )
    }
    logger.info('Approval success')

    //
    // Step 2: Send the multi-transfers tx and wait for its confirmation.
    ///
    const txHash = await this.token.creditMulti(addresses, amounts, {
      gasPrice
    })
    logger.info(`Sent creditMulti tx to the network. txHash=${txHash}`)

    const { status, receipt } = await this.token.waitForTxConfirmation(txHash, {
      numBlocks: NumBlockConfirmation,
      timeoutSec: ConfirmationTimeoutSec
    })
    if (status !== 'confirmed') {
      throw new Error(`Failure. txStatus=${status} txHash=${txHash}`)
    }

    // All done!
    logger.info('Blockchain creditMulti transaction confirmed')
    logger.info('  NetworkId:             ', this.networkId)
    logger.info('  GasMultiplier:         ', this.gasPriceMultiplier)
    logger.info('  GasPrice:              ', gasPrice.toFixed())
    logger.info('  Total Amount (natural):', total.toFixed())
    logger.info(
      '  Total Amount (token):  ',
      this.token.toTokenUnit(total).toFixed()
    )
    logger.info('  TxHash:                ', receipt.transactionHash)
    logger.info('  BlockNumber:           ', receipt.blockNumber)
    logger.info('  From:                  ', this.supplier)
    logger.info('  To:                    ', addresses)
    return receipt
  }
}

module.exports = TokenDistributor
