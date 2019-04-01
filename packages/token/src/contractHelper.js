const Web3 = require('web3')

const { withRetries } = require('./util')

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
    const provider = this.config.providers[networkId]
    return new Web3(provider)
  }

  /**
   * Sends an Ethereum transaction.
   * @param {string} networkId - Ethereum network ID.
   * @param {transaction} transaction - These are returned by contract.methods.MyMethod()
   * @param {Object} opts - Options to be sent along with the transaction.
   * @returns {Object} - Transaction receipt.
   */
  async sendTransaction(networkId, transaction, opts = {}) {
    const web3 = this.web3(networkId)

    if (!opts.from) {
      opts.from = await this.defaultAccount(networkId)
    }

    if (!opts.gas) {
      opts.gas = await transaction.estimateGas({ from: opts.from })
      this.vlog('estimated gas:', opts.gas)
    }

    if (opts.gasPrice) {
      this.vlog('gas price:', opts.gasPrice)
    }

    // Send the transaction and grab the transaction hash when it's available.
    this.vlog('sending transaction')
    let transactionHash
    transaction.send(opts).once('transactionHash', hash => {
      transactionHash = hash
      this.vlog('transaction hash:', transactionHash)
    })
    this.vlog('waiting for transaction receipt')

    // Poll for the transaction receipt, with an exponential backoff. This works
    // around some strange interactions between web3.js and some web3 providers.
    // For example, this issue sometimes prevents transaction receipts from
    // being returned when simply calling
    // `await contract.methods.MyMethod(...).send(...)`:
    //
    // https://github.com/INFURA/infura/issues/95

    // Blocks are mined every ~15 seconds, but it sometimes takes ~40-60 seconds
    // to get a transaction receipt from rinkeby.infura.io.
    const retryOpts = { maxRetries: 10, verbose: this.config.verbose }
    return await withRetries(retryOpts, async () => {
      if (transactionHash) {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash)
        if (receipt) {
          this.vlog('got transaction receipt', receipt)
          if (!receipt.status) {
            throw new Error('transaction failed')
          }
          if (this.config.multisig) {
            this.vlog(
              'multi-sig transaction submitted: it may require more signatures'
            )
          } else {
            this.vlog('transaction successful')
          }
          return receipt
        } else {
          throw new Error('still waiting for transaction receipt')
        }
      } else {
        throw new Error('still waiting for transaction hash')
      }
    })
  }

  /**
   * Logs provided arguments with a timestamp if this.verbose is true.
   */
  // TODO: refactor into separate base class
  vlog(/* all arguments are passed to console.log */) {
    if (this.config.verbose) {
      console.log(new Date().toString(), ...arguments)
    }
  }

  /**
   * Returns the default Ethereum account.
   * @param {int} networkId - Network ID.
   * @returns {string} - Address of default of first unlocked account.
   */
  async defaultAccount(networkId) {
    const accounts = await this.web3(networkId).eth.getAccounts()
    return accounts[0]
  }
}

module.exports = ContractHelper
