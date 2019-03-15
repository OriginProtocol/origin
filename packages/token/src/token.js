const BigNumber = require('bignumber.js')

const TokenContract = require('@origin/contracts/build/contracts/OriginToken.json')

const { withRetries } = require('./util')
const ContractHelper = require('./contractHelper')

// Token helper class.
class Token extends ContractHelper {
  /*
   * @params {object} config - Configuration dict.
   */
  constructor(config) {
    super(config)
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
    return (
      this.config.contractAddress ||
      (TokenContract.networks[networkId] &&
        TokenContract.networks[networkId].address)
    )
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
    if (!contractAddress) {
      throw new Error(
        `Could not get address of OriginToken contract for networkId ${networkId}`
      )
    }
    return new web3.eth.Contract(TokenContract.abi, contractAddress)
  }

  /*
   * Credits tokens to an address.
   * @params {string} networkId - Test network Id.
   * @params {string} address - Address for the recipient.
   * @params {int} value - Value to credit, in natural unit.
   * @throws Throws an error if the operation failed.
   * @returns {Object} - Transaction receipt
   */
  async credit(networkId, address, value) {
    const contract = this.contract(networkId)

    // At token contract deployment, the entire initial supply of tokens is assigned to
    // the first address generated using the mnemonic.
    const tokenSupplier = await this.defaultAccount(networkId)

    // Transfer numTokens from the supplier to the target address.
    const supplierBalance = await contract.methods
      .balanceOf(tokenSupplier)
      .call()
    if (BigNumber(value).gt(supplierBalance)) {
      throw new Error('insufficient funds for token transfer')
    }
    const paused = await contract.methods.paused().call()
    if (paused) {
      throw new Error('token transfers are paused')
    }
    const transaction = contract.methods.transfer(address, value)
    return await this.sendTransaction(networkId, transaction, {
      from: tokenSupplier
    })
  }

  /*
   * Returns the token balance for a address on the specified network.
   * @params {string} networkId - Test network Id.
   * @params {string} address - Address to query balance of.
   * @throws Throws an error if the operation failed.
   * @returns {BigNumber} - Token balance of the address, in natural unit.
   */
  async balance(networkId, address) {
    const contract = this.contract(networkId)
    const balance = await contract.methods.balanceOf(address).call()
    return BigNumber(balance)
  }

  /**
   * Pauses transfers and approvals of tokens.
   * @param {string} networkId - Ethereum network ID.
   */
  async pause(networkId) {
    const contract = this.contract(networkId)
    const sender = await this.defaultAccount(networkId)

    // Pre-contract call validations.
    const alreadyPaused = await contract.methods.paused().call()
    if (alreadyPaused) {
      throw new Error('Token is already paused')
    }
    await this.ensureContractOwner(contract, sender)

    const transaction = contract.methods.pause()
    await this.sendTransaction(networkId, transaction, { from: sender })

    await withRetries({ verbose: this.config.verbose }, async () => {
      if (
        !this.config.multisig &&
        (await contract.methods.paused().call()) !== true
      ) {
        throw new Error('Still waiting for token to be paused')
      }
    })
  }

  /**
   * Unpauses transfers and approvals of tokens.
   * @param {string} networkId - Ethereum network ID.
   */
  async unpause(networkId) {
    const contract = await this.contract(networkId)
    const sender = await this.defaultAccount(networkId)

    // Pre-contract call validations.
    const paused = await contract.methods.paused().call()
    if (!paused) {
      throw new Error('Token is already unpaused')
    }
    await this.ensureContractOwner(contract, sender)

    const transaction = contract.methods.unpause()
    await this.sendTransaction(networkId, transaction, { from: sender })
    await withRetries({ verbose: this.config.verbose }, async () => {
      if (
        !this.config.multisig &&
        (await contract.methods.paused().call()) !== false
      ) {
        throw new Error('Still waiting for token to be unpaused')
      }
    })
  }

  /**
   * Changes the owner of the token contract to the given address.
   * @param {string} networkId - Ethereum network ID.
   * @param {string} newOwner - Address of the new owner.
   */
  async setOwner(networkId, newOwner) {
    const contract = await this.contract(networkId)
    return await this._setOwner(networkId, contract, newOwner)
  }

  /**
   * Returns the owner of the token contract.
   * @param {string} networkId - Ethereum network ID.
   * @param {returns} - Address of the token owner.
   */
  async owner(networkId) {
    const contract = await this.contract(networkId)
    return await contract.methods.owner().call()
  }

  /**
   * Displays status of the token.
   * @param {string} networkId - Ethereum network ID.
   */
  async logStatus(networkId) {
    const contract = await this.contract(networkId)
    const name = await contract.methods.name().call()
    const decimals = await contract.methods.decimals().call()
    const symbol = await contract.methods.symbol().call()
    const totalSupply = BigNumber(await contract.methods.totalSupply().call())
    const totalSupplyTokens = this.toTokenUnit(totalSupply)
    const paused = await contract.methods.paused().call()
    const address = await this.contractAddress(networkId)
    const owner = await this.owner(networkId)
    let whitelistStatus
    if (await contract.methods.whitelistActive().call()) {
      const expiration = await contract.methods.whitelistExpiration().call()
      const expirationDate = new Date(expiration * 1000)
      whitelistStatus = `active until ${expirationDate}`
    } else {
      whitelistStatus = 'not active'
    }

    console.log(`Token status for network ${networkId}:`)
    console.log(`contract address:        ${address}`)
    console.log(`name:                    ${name}`)
    console.log(`decimals:                ${decimals}`)
    console.log(`symbol:                  ${symbol}`)
    console.log(`total supply (natural):  ${totalSupply.toFixed(0)}`)
    console.log(`total supply (tokens):   ${totalSupplyTokens}`)
    console.log(`contract owner:          ${owner}`)
    console.log(`transfers paused:        ${paused ? 'YES' : 'no'}`)
    console.log(`transactor whitelist:    ${whitelistStatus}`)
  }
}

module.exports = Token
