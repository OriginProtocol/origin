const BigNumber = require('bignumber.js')
const TokenContract = require('../../contracts/build/contracts/OriginToken.json')
const Web3 = require('web3')

// Token helper class.
class Token {
  /*
   * @params {object} config - Configuration dict.
   */
  constructor(config) {
    this.config = config
    // TODO(franck): Get this from the token contract ABI.
    this.decimals = 18
    this.scaling = BigNumber(10).exponentiatedBy(this.decimals)
  }

  /*
  * Converts from token unit to "natural unit" aka fixed-point representation.
  * The token contract only manipulates natural units.
  * @param {int|BigNumber} - Value in token unit.
  * @return {BigNumber} - Value in natural unit.
  */
  toNaturalUnit(value) {
    return BigNumber(value).multipliedBy(this.scaling)
  }

  /*
   * Converts from natural unit to token unit aka decimal representation.
   * @param {BigNumber} - Value in natural unit.
   * @return {BigNumber} - Value in token unit.
   */
  toTokenUnit(value) {
    return BigNumber(value).dividedBy(this.scaling)
  }

  /*
   * Returns the token contract's address.
   * @params {string} networkId - Test network Id.
   * @return {string} - Address contract was deployed to.
   */
  contractAddress(networkId) {
    return TokenContract.networks[networkId].address
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

  /*
   * Returns token contract object for the specified network.
   * @params {string} networkId - Test network Id.
   * @throws Throws an error if the operation failed.
   * @returns {object} - Promise that resolves to contract object.
   */
  contract(networkId) {
    const web3 = this.web3(networkId)

    // Create a token contract objects based on its ABI and address on the network.
    const contractAddress = this.contractAddress(networkId)
    return new web3.eth.Contract(TokenContract.abi, contractAddress)
  }

  /*
   * Credits tokens to a wallet.
   * @params {string} networkId - Test network Id.
   * @params {string} wallet - Address of the recipient wallet.
   * @params {int} value - Value to credit, in natural unit.
   * @throws Throws an error if the operation failed.
   * @returns {BigNumber} - Token balance of the wallet, in natural unit.
   */
  async credit(networkId, wallet, value) {
    const contract = this.contract(networkId)

    // At token contract deployment, the entire initial supply of tokens is assigned to
    // the first wallet generated using the mnemonic.
    const provider = this.config.providers[networkId]
    const tokenSupplier = provider.addresses[0]

    // Transfer numTokens from the supplier to the target wallet.
    const supplierBalance = await contract.methods.balanceOf(tokenSupplier).call()
    if (value > supplierBalance) {
      throw new Error('insufficient funds for token transfer')
    }
    const paused = await contract.methods.paused().call()
    if (paused) {
      throw new Error('token transfers are paused')
    }
    const transaction = contract.methods.transfer(wallet, value)
    await this.sendTransaction(networkId, transaction, { from: tokenSupplier })

    // Return wallet's balance after credit.
    return this.balance(networkId, wallet)
  }

  /*
   * Returns the token balance for a wallet on the specified network.
   * @params {string} networkId - Test network Id.
   * @params {string} wallet - Address of the recipient wallet.
   * @throws Throws an error if the operation failed.
   * @returns {BigNumber} - Token balance of the wallet, in natural unit.
   */
  async balance(networkId, wallet) {
    const contract = this.contract(networkId)
    const balance = await contract.methods.balanceOf(wallet).call()
    return BigNumber(balance)
  }

  /**
   * Pauses transfers and approvals of tokens.
   * @param {string} networkId - Ethereum network ID.
   */
  async pause(networkId) {
    const contract = this.contract(networkId)
    const sender = this.defaultAccount(networkId)

    // Pre-contract call validations.
    const alreadyPaused = await contract.methods.paused().call()
    if (alreadyPaused) {
      throw new Error('Token is already paused')
    }
    const tokenOwner = await contract.methods.owner().call()
    if (tokenOwner.toLowerCase() != sender.toLowerCase()) {
      throw new Error(`Sender ${sender} is not owner of token contract (${tokenOwner})`)
    }

    const transaction = contract.methods.pause()
    await this.sendTransaction(networkId, transaction, { from: sender })
    if (await contract.methods.paused().call() !== true) {
      throw new Error('Token should be paused but is not')
    }
  }

  /**
   * Unpauses transfers and approvals of tokens.
   * @param {string} networkId - Ethereum network ID.
   */
  async unpause(networkId) {
    const contract = await this.contract(networkId)
    const sender = this.defaultAccount(networkId)

    // Pre-contract call validations.
    const paused = await contract.methods.paused().call()
    if (!paused) {
      throw new Error('Token is already unpaused')
    }
    const tokenOwner = await contract.methods.owner().call()
    if (tokenOwner.toLowerCase() != sender.toLowerCase()) {
      throw new Error(`Sender ${sender} is not owner of token contract (${tokenOwner})`)
    }

    const transaction = contract.methods.unpause()
    await this.sendTransaction(networkId, transaction, { from: sender })
    if (await contract.methods.paused().call() !== false) {
      throw new Error('Token should be unpaused but is not')
    }
  }

  // TODO: refactor into separate base class, to support other contracts such
  // as the marketplace contract
  /**
   * Sends an Ethereum transaction.
   * @param {string} networkId - Ethereum network ID.
   * @param {transaction} transaction - These are returned by contract.methods.MyMethod()
   * @param {Object} opts - Options to be sent along with the transaction.
   * @returns {Object} - Transaction receipt.
   */
  async sendTransaction(networkId, transaction, opts = {}) {
    // TODO: support multisig wallets

    const web3 = this.web3(networkId)

    let transactionHash
    if (!opts.gas) {
      opts.gas = await transaction.estimateGas({ from: opts.from })
      this.vlog('estimated gas:', opts.gas)
    }

    // Send the transaction and grab the transaction hash when it's available.
    this.vlog('sending transaction')
    transaction.send(opts)
      .on('transactionHash', (hash) => {
        transactionHash = hash
        this.vlog('transaction hash:', transactionHash)
      })

    // Poll for the transaction receipt, with an exponential backoff. This works
    // around some strange interactions between web3.js and some web3 providers.
    // For example, this issue sometimes prevents transaction receipts from
    // being returned when simply calling
    // `await contract.methods.MyMethod(...).send(...)`:
    //
    // https://github.com/INFURA/infura/issues/95

    // Blocks are mined every ~15 seconds, but it sometimes takes ~40-60 seconds
    // to get a transaction receipt from rinkeby.infura.io.
    const maxSleep = 120000
    let totalSleep = 0
    let sleepTime = 1000
    while (totalSleep <= maxSleep) {
      this.vlog(`waiting ${sleepTime / 1000}s for transaction receipt`)
      await sleep(sleepTime)

      if (transactionHash) {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash)
        if (receipt) {
          this.vlog('got transaction receipt', receipt)
          if (receipt.status) {
            this.vlog('transaction successful')
            return receipt
          } else {
            throw new Error('transaction failed')
          }
        }
      } else {
        this.vlog('still waiting for transaction hash')
      }

      sleepTime *= 2
      totalSleep += sleepTime
    }
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
  defaultAccount(networkId) {
    const provider = this.config.providers[networkId]
    return provider.addresses[0]
  }
}

/**
 * Returns a promise that resolves after the specified duration.
 * @param {int} ms - Milliseconds to sleep for.
 * @returns {Promise} - Promise that resolves after ms milliseconds.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = Token
