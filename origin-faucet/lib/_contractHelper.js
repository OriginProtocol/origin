const Web3 = require('web3')

const IMultiSigWallet = require('origin-contracts/build/contracts/IMultiSigWallet.json')
const { withRetries } = require('../faucet/util.js')

const { isValidOwner, validOwners } = require('./owner_whitelist.js')

class ContractHelper {
  constructor(config) {
    this.config = config
    this.retries = 7
    this.validOwners = validOwners
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
   * Changes the owner of the given contract to the given address.
   * @param {string} networkId - Ethereum network ID.
   * @param {string} newOwner - Address of the new owner.
   */
  async _setOwner(networkId, contract, newOwner) {
    const sender = await this.defaultAccount(networkId)
    const newOwnerLower = newOwner.toLowerCase()

    // Pre-contract call validations.
    if (
      !this.config.overrideOwnerWhitelist &&
      !isValidOwner(networkId, newOwner, this.validOwners)
    ) {
      throw new Error(`${newOwner} is not a valid owner for the token contract`)
    }
    await this.ensureContractOwner(contract, sender)
    const oldOwner = await contract.methods.owner().call()
    if (oldOwner.toLowerCase() === newOwnerLower) {
      throw new Error('old and new owner are the same')
    }

    const transaction = contract.methods.transferOwnership(newOwner)
    await this.sendTransaction(networkId, transaction, { from: sender })
    await withRetries({ verbose: this.config.verbose }, async () => {
      const ownerAfterTransaction =
        (await contract.methods.owner().call()).toLowerCase()
      if (
        !this.config.multisig &&
        ownerAfterTransaction !== newOwner.toLowerCase()
      ) {
        throw new Error(`New owner should be ${newOwner} but is ${ownerAfterTransaction}`)
      }
    })
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

    if (this.config.multisig) {
      // For multi-sig transactions, we submit the transaction to the multi-sig
      // wallet instead of the token contract.
      const contract = await this.contract(networkId)
      transaction = await this.multiSigTransaction({
        networkId,
        sender: opts.from,
        multiSigWalletAddress: this.config.multisig,
        contractAddress: contract._address,
        transaction
      })
    }

    if (!opts.gas) {
      opts.gas = await transaction.estimateGas({ from: opts.from })
      this.vlog('estimated gas:', opts.gas)
    }

    // Send the transaction and grab the transaction hash when it's available.
    this.vlog('sending transaction')
    let transactionHash
    transaction.send(opts)
      .once('transactionHash', (hash) => {
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
            this.vlog('multi-sig transaction submitted: it may require more signatures')
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
   * Sends the given transaction to the multi-sig wallet for potentially further
   * signatures.
   * @param {string} networkId - Ethereum network ID.
   * @param {string} sender - Transaction sender address.
   * @param {string} multiSigWalletAddress - Address of multi-sig wallet.
   * @param {string} contractAddress - Address of contract for which we're making the contract call.
   * @param {Object} transaction - Ethereum transaction to be sent to the multi-sig wallet.
   */
  async multiSigTransaction({
    networkId,
    sender,
    multiSigWalletAddress,
    contractAddress,
    transaction
  }) {
    const web3 = this.web3(networkId)
    const data = await transaction.encodeABI()
    const wallet = new web3.eth.Contract(IMultiSigWallet.abi, multiSigWalletAddress)
    this.vlog('transaction data:', data)
    this.vlog(`using multi-sig wallet ${multiSigWalletAddress} for txn to ${contractAddress}`)

    // Ensure that the sender is a signer/owner for the wallet.
    const isOwner = await wallet.methods.isOwner(sender).call()
    if (!isOwner) {
      throw `${sender} is not an owner of the multisig wallet`
    }

    return wallet.methods.submitTransaction(contractAddress, 0, data)
  }

  // TODO: extract this into a separate base class
  /**
   * Throws an error if 'address' isn't the owner of the contract.
   * @param {string} networkId - Ethereum network ID.
   * @param {string} address - Address to check.
   */
  async ensureContractOwner(contract, address) {
    const owner = await contract.methods.owner().call()
    const multisig = this.config.multisig

    if (multisig) {
      // Ensure that the multisig wallet is the owner of the contract.
      if (multisig.toLowerCase() !== owner.toLowerCase()) {
        throw new Error(`multi-sig wallet ${this.config.multisig} isn't contract owner ${owner}`)
      }
    } else {
      if (address.toLowerCase() !== owner.toLowerCase()) {
        throw new Error(`sender ${address} isn't contract owner ${owner}`)
      }
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
  async defaultAccount(networkId) {
    const accounts = await this.web3(networkId).eth.getAccounts()
    return accounts[0]
  }
}

module.exports = ContractHelper
