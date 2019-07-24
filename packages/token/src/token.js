const BigNumber = require('bignumber.js')

const TokenContract = require('@origin/contracts/releases/latest/build/contracts/OriginToken.json')
const logger = require('./logger')

const isTestEnv = process.env.NODE_ENV === 'test'

const ContractAddresses = {
  1: '@origin/contracts/build/contracts_mainnet.json',
  4: '@origin/contracts/build/contracts_rinkeby.json',
  999: '@origin/contracts/build/contracts.json',
  2222: '@origin/contracts/build/contracts_origin.json'
}
if (isTestEnv) {
  ContractAddresses['999'] = '@origin/contracts/build/tests.json'
}

async function _nextTick(wait = 1000) {
  return new Promise(resolve => setTimeout(() => resolve(true), wait))
}

// Token class.
class Token {
  /**
   * @params {number} networkId: 1=Mainnet, 4=Rinkeby, etc...
   * @params {Object} provider: web3 provider
   */
  constructor(networkId, provider) {
    this.networkId = networkId
    this.web3 = provider
    // TODO(franck): Get this from the token contract ABI.
    this.decimals = 18
    this.scaling = BigNumber(10).exponentiatedBy(this.decimals)

    if (!ContractAddresses[this.networkId]) {
      throw new Error(`Unsupported network id ${this.networkId}`)
    }
    // Load the json file that stores the various contracts addresses.
    const addresses = require(ContractAddresses[networkId])
    if (!addresses.OGN) {
      throw new Error(
        `OGN contract address for network ${networkId} not found.`
      )
    }
    this.contractAddress = addresses.OGN
    this.contract = this.web3 ? new this.web3.eth.Contract(
      TokenContract.abi,
      this.contractAddress
    ) : null
  }

  /**
   * Converts from token unit to "natural unit" aka fixed-point representation.
   * The token contract only manipulates natural units.
   * @param {int|BigNumber} - Value in token unit.
   * @return {BigNumber} - Value in natural unit.
   */
  toNaturalUnit(value) {
    return BigNumber(value).multipliedBy(this.scaling)
  }

  /**
   * Converts from natural unit to token unit aka decimal representation.
   * @param {BigNumber} - Value in natural unit.
   * @return {BigNumber} - Value in token unit.
   */
  toTokenUnit(value) {
    return BigNumber(value).dividedBy(this.scaling)
  }

  /**
   * Returns the address of the account used for distributing tokens.
   * @returns {Promise<string>}
   */
  async senderAddress() {
    return await this.defaultAccount()
  }

  /**
   * Credits tokens to an address.
   * @params {string} address - Address for the recipient.
   * @params {BigNumber|int} value - Value to credit, in natural unit.
   * @params {Object} opts - Options. For example gasPrice.
   * @throws Throws an error if the operation failed.
   * @returns {string} - Transaction hash
   */
  async credit(address, value, opts = {}) {
    // At token contract deployment, the entire initial supply of tokens is assigned to
    // the first address generated using the mnemonic.
    const supplier = await this.defaultAccount()

    // Transfer numTokens from the supplier to the target address.
    const balance = await this.contract.methods.balanceOf(supplier).call()
    if (BigNumber(value).gt(balance)) {
      throw new Error(`Supplier ${supplier} balance is too low: ${balance}`)
    }
    const paused = await this.contract.methods.paused().call()
    if (paused) {
      throw new Error('token transfers are paused')
    }
    const transaction = this.contract.methods.transfer(address, value)
    return await this.sendTx(transaction, {
      from: supplier,
      ...opts
    })
  }

  /**
   * Sends an Ethereum transaction.
   * @param {transaction} transaction - These are returned by contract.methods.MyMethod()
   * @param {Object} opts - Options to be sent along with the transaction.
   * @returns {string} - Transaction hash.
   */
  async sendTx(transaction, opts = {}) {
    if (!opts.from) {
      opts.from = await this.defaultAccount()
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
   * @param {string} txHash: the transaction hash.
   * @param {number} numBlocks: the number of block confirmation to wait for
   * @param {number} timeoutSec: timeout in seconds
   * @returns {Promise<{status:string, receipt:Object}>}
   * Possible values for status:
   *  'confirmed': the transaction was confirmed. A receipt is returned.
   *  'failed': the transaction was reverted by the EVM. A receipt is returned.
   *  'timeout': timed out before being able to confirm the transaction. No receipt.
   */
  async waitForTxConfirmation(txHash, { numBlocks = 8, timeoutSec = 600 }) {
    const start = Date.now()
    let elapsed = 0,
      receipt = null

    do {
      try {
        receipt = await this.web3.eth.getTransactionReceipt(txHash)
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
            const blockNumber = await this.web3.eth.getBlockNumber()
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
      elapsed = (Date.now() - start) / 1000
      logger.debug(
        `Still waiting for txHash ${txHash} to get confirmed after ${elapsed} sec`
      )
    } while (elapsed < timeoutSec && (await _nextTick(5000)))

    return { status: 'timeout', receipt: null }
  }

  /**
   * Returns the default Ethereum account.
   * @returns {string} - Address of first account.
   */
  async defaultAccount() {
    return this.web3.eth.currentProvider.getAddresses()[0]
  }

  /*
   * Returns the token balance for a address on the specified network.
   * @params {string} address - Address to query balance of.
   * @throws Throws an error if the operation failed.
   * @returns {BigNumber} - Token balance of the address, in natural unit.
   */
  async balance(address) {
    const balance = await this.contract.methods.balanceOf(address).call()
    return BigNumber(balance)
  }

  /**
   * Pauses transfers and approvals of tokens.
   */
  async pause() {
    const sender = await this.defaultAccount()

    // Pre-contract call validations.
    const alreadyPaused = await this.contract.methods.paused().call()
    if (alreadyPaused) {
      throw new Error('Token is already paused')
    }
    // TODO: implement this method.
    // await this.ensureContractOwner(this.contract, sender)

    const transaction = this.contract.methods.pause()
    const txHash = await this.sendTx(transaction, { from: sender })
    logger.info(`Sent pause tx to network, hash=${txHash}`)
    const { status } = await this.waitForTxConfirmation(txHash)
    if (status !== 'confirmed') {
      throw new Error(
        `Failed getting confirmation. txHash=${txHash} status=${status}`
      )
    }
  }

  /**
   * Unpauses transfers and approvals of tokens.
   */
  async unpause() {
    const sender = await this.defaultAccount()

    // Pre-contract call validations.
    const paused = await this.contract.methods.paused().call()
    if (!paused) {
      throw new Error('Token is already unpaused')
    }
    // TODO: implement this method.
    // await this.ensureContractOwner(this.contract, sender)

    const transaction = this.contract.methods.unpause()
    const txHash = await this.sendTx(transaction, {
      from: sender
    })
    logger.info(`Sent unpause tx to network, hash=${txHash}`)
    const { status } = await this.waitForTxConfirmation(txHash)
    if (status != 'confirmed') {
      throw new Error(
        `Failed getting confirmation. txHash=${txHash} status=${status}`
      )
    }
  }

  /**
   * Returns the owner of the token contract.
   * @param {returns} - Address of the token owner.
   */
  async owner() {
    return await this.contract.methods.owner().call()
  }

  /**
   * Displays status of the token.
   */
  async logStatus() {
    const name = await this.contract.methods.name().call()
    const decimals = await this.contract.methods.decimals().call()
    const symbol = await this.contract.methods.symbol().call()
    const totalSupply = BigNumber(
      await this.contract.methods.totalSupply().call()
    )
    const totalSupplyTokens = this.toTokenUnit(totalSupply)
    const paused = await this.contract.methods.paused().call()
    const address = await this.contractAddress()
    const owner = await this.owner()
    let whitelistStatus
    if (await this.contract.methods.whitelistActive().call()) {
      const expiration = await this.contract.methods
        .whitelistExpiration()
        .call()
      const expirationDate = new Date(expiration * 1000)
      whitelistStatus = `active until ${expirationDate}`
    } else {
      whitelistStatus = 'not active'
    }

    logger.info(`Token status for network ${this.networkId}:`)
    logger.info(`contract address:        ${address}`)
    logger.info(`name:                    ${name}`)
    logger.info(`decimals:                ${decimals}`)
    logger.info(`symbol:                  ${symbol}`)
    logger.info(`total supply (natural):  ${totalSupply.toFixed(0)}`)
    logger.info(`total supply (tokens):   ${totalSupplyTokens}`)
    logger.info(`contract owner:          ${owner}`)
    logger.info(`transfers paused:        ${paused ? 'YES' : 'no'}`)
    logger.info(`transactor whitelist:    ${whitelistStatus}`)
  }
}

module.exports = Token
