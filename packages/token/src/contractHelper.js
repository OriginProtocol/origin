const logger = require('./logger')

async function _nextTick(wait = 1000) {
  return new Promise(resolve => setTimeout(() => resolve(true), wait))
}

class ContractHelper {
  constructor(config) {
    this.config = config
  }

  /**
   * Returns a web3 object with a provider for the given network ID.
   * @params {string} networkId - Network ID.
   * @returns {object} - Promise that resolves to contract object.
   */
  web3(networkId) {
    return this.config.providers[networkId]
  }

  /**
   * Sends an Ethereum transaction.
   * @param {number} networkId - Ethereum network ID.
   * @param {transaction} transaction - These are returned by contract.methods.MyMethod()
   * @param {Object} opts - Options to be sent along with the transaction.
   * @returns {string} - Transaction hash.
   */
  async sendTx(networkId, transaction, opts = {}) {
    if (!opts.from) {
      opts.from = await this.defaultAccount(networkId)
    }

    if (!opts.gas) {
      opts.gas = await transaction.estimateGas({ from: opts.from })
      logger.info('Estimated gas:', opts.gas)
    }

    if (opts.gasPrice) {
      logger.info('Gas price:', opts.gasPrice)
    }

    // Send the transaction and grab the transaction hash when it's available.
    logger.info('Sending transaction')
    const txHash = await new Promise((resolve, reject) => {
      try {
        transaction.send(opts).once('transactionHash', hash => {
          resolve(hash)
        })
      } catch (e) {
        logger.error(`Failed sending transaction: ${e}`)
        reject(e)
      }
    })
    logger.info(`Sent transaction with hash: ${txHash}`)
    return txHash
  }

  /**
   * Waits for a transaction to be confirmed.
   * @param {number} networkId: 1=mainnet, 4=rinkeby, etc...
   * @param {number} txHash: the transaction hash.
   * @param {number} numBlocks: the number of block confirmation to wait for
   * @param {number} timeoutSec: timeout in seconds
   * @returns {Promise<{status:string, receipt:Object}>}
   * Possible values for status:
   *  'confirmed': the transaction was confirmed. A receipt is returned.
   *  'failed': the transaction was reverted by the EVM. A receipt is returned.
   *  'timeout': timed out before being able to confirm the transaction. No receipt.
   */
  async waitForTxConfirmation(
    networkId,
    txHash,
    { numBlocks = 8, timeoutSec = 600 }
  ) {
    const web3 = this.web3(networkId)
    const start = Date.now()
    let elapsed = 0,
      receipt = null

    do {
      try {
        receipt = await web3.eth.getTransactionReceipt(txHash)
      } catch (e) {
        logger.error(`getTransactionReceipt failure for txHash ${txHash}`, e)
      }
      // Note: we check on presence of both receipt and receipt.blockNumber
      // to account for difference between Geth and Parity:
      //  - Geth does not return a receipt until transaction mined
      //  - Parity returns a receipt with no blockNumber until transaction mined.
      if (receipt && receipt.blockNumber) {
        if (!receipt.status) {
          // Transaction was reverted by the EVM.
          return { status: 'failed', receipt }
        } else {
          // Calculate the number of block confirmations.
          try {
            const blockNumber = await web3.eth.getBlockNumber()
            const numConfirmations = blockNumber - receipt.blockNumber
            if (numConfirmations >= numBlocks) {
              // Transaction confirmed.
              return { status: 'confirmed', receipt }
            }
          } catch (e) {
            logger.error('getBlockNumber failure', e)
          }
        }
      }
      logger.debug(
        `Still waiting for txHash ${txHash} to get confirmed after ${elapsed} sec`
      )
      elapsed = (Date.now() - start) / 1000
    } while (elapsed < timeoutSec && (await _nextTick(5000)))

    return { status: 'timeout', receipt: null }
  }

  /**
   * Returns the default Ethereum account.
   * @param {int} networkId - Network ID.
   * @returns {string} - Address of default of first unlocked account.
   */
  async defaultAccount(networkId) {
    return this.web3(networkId).eth.defaultAccount
  }
}

module.exports = ContractHelper
