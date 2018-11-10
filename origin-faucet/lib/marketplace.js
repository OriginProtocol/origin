const V00_Marketplace_Contract = require('origin-contracts/build/contracts/V00_Marketplace.json')
const TokenContract = require('origin-contracts/build/contracts/OriginToken.json')

const ContractHelper = require('./_contractHelper.js')

// Note that we can't import contract-service, because it uses 'import' and
// other features we can't use in a Node command-line tool.

// Marketplace helper contract. Interacts with all active marketplace contracts.
class Marketplace extends ContractHelper{
  constructor(config) {
    super(config)
    // TODO: ensure that this is synced with list of contracts through a test
    this.contractJsons = [
      V00_Marketplace_Contract
    ]
  }
  /*
   * Returns marketplace contract objects for the specified network.
   * @params {string} networkId - Test network Id.
   * @returns {array} - Array of human-readable names of contracts to contract objects.
   */
  async contracts(networkId) {
    const web3 = this.web3(networkId)
    const contractObjs = {}
    this.contractJsons.forEach((contract) => {
      // In CI, contracts are deployed *after* contract tests run. So, they
      // won't have any addresses for the local blockchain used by CI. We check
      // for that here, and the tests will deploy their own contracts.
      if (contract.networks[networkId] && contract.networks[networkId].address) {
        contractObjs[contract.contractName] = new web3.eth.Contract(
          contract.abi,
          contract.networks[networkId].address
        )
      }
    })
    if (Object.keys(contractObjs).length === 0) {
      console.error('ERROR: Could not find any deployed marketplace contracts!')
      process.exit(1)
    }
    return contractObjs
  }

  /**
   * Displays status of marketplace contracts.
   * @param {string} networkId - Ethereum network ID.
   */
  async logStatus(networkId) {
    const contractObjs = await this.contracts(networkId)
    for (const [name, contract] of Object.entries(contractObjs)) {
      const owner = await contract.methods.owner().call()
      const listingCount = await contract.methods.totalListings().call()
      const tokenAddress = await contract.methods.tokenAddr().call()
      console.log(`name:          ${name}`)
      console.log(`address:       ${contract._address}`)
      console.log(`owner:         ${owner}`)
      console.log(`# of listings: ${listingCount}`)
      console.log(`token address: ${tokenAddress}`)
      console.log('')
    }
  }

  /**
   * Changes the owner of a marketplace contract to the given address.
   * @param {string} networkId - Ethereum network ID.
   * @param {string} contractName - Human readable name for the contract. e.g. "V00_Marketplace"
   * @param {string} newOwner - Address of the new owner.
   */
  async setOwner(networkId, contractName, newOwner) {
    const contract = (await this.contracts(networkId))[contractName]
    if (!contract) {
      throw new Error(`Could not get contract ${contractName}`)
    }
    return await this._setOwner(networkId, contract, newOwner)
  }

    /**
   * Set the address of the Origin token stored in the marketplace contract.
   * @param {string} networkId - Ethereum network ID.
   * @param {string} contractName - Human readable name for the contract. e.g. "V00_Marketplace"
   * @param {string} tokenAddress - Address of the Origin token contract to use.
   */

  async setTokenAddress(networkId, contractName, tokenAddress) {
    const contract = (await this.contracts(networkId))[contractName]
    if (!contract) {
      throw new Error(`Could not get contract ${contractName}`)
    }
    const oldTokenAddress = await contract.methods.tokenAddr().call()
    this.vlog(`old token address:`, oldTokenAddress)
    if (oldTokenAddress.toLowerCase() === tokenAddress.toLowerCase()) {
      console.error(`${tokenAddress} is already the token address for ${contractName}!`)
      return
    }

    // Ensure we're dealing with a valid token contract
    const web3 = this.web3(networkId)
    const token = new web3.eth.Contract(TokenContract.abi, tokenAddress)
    const symbol = await token.methods.symbol().call()
    if (symbol !== 'OGN') {
      throw new Error(`Given token has symbol ${symbol} instead of OGN`)
    }

    // Send transaction.
    this.vlog(`setting token address to ${tokenAddress}`)
    const sender = await this.defaultAccount(networkId)
    const transaction = contract.methods.setTokenAddr(tokenAddress)
    await this.sendTransaction(networkId, transaction, { from: sender })
  }
}

module.exports = Marketplace
