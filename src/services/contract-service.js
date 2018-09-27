import ClaimHolderRegistered from './../../contracts/build/contracts/ClaimHolderRegistered.json'
import ClaimHolderPresigned from './../../contracts/build/contracts/ClaimHolderPresigned.json'
import ClaimHolderLibrary from './../../contracts/build/contracts/ClaimHolderLibrary.json'
import KeyHolderLibrary from './../../contracts/build/contracts/KeyHolderLibrary.json'
import V00_UserRegistry from './../../contracts/build/contracts/V00_UserRegistry.json'
import OriginIdentity from './../../contracts/build/contracts/OriginIdentity.json'
import OriginToken from './../../contracts/build/contracts/OriginToken.json'

import V00_Marketplace from './../../contracts/build/contracts/V00_Marketplace.json'

import BigNumber from 'bignumber.js'
import bs58 from 'bs58'
import Web3 from 'web3'

const emptyAddress = '0x0000000000000000000000000000000000000000'
const NUMBER_CONFIRMATIONS_TO_REPORT = 20
const SUPPORTED_ERC20 = [
  { symbol: 'OGN', decimals: 18, contractName: 'OriginToken' }
]

class ContractService {
  constructor({ web3, contractAddresses } = {}) {
    const externalWeb3 = web3 || window.web3
    if (!externalWeb3) {
      throw new Error(
        'web3 is required for Origin.js. Please pass in web3 as a config option.'
      )
    }
    this.web3 = new Web3(externalWeb3.currentProvider)

    this.marketplaceContracts = { V00_Marketplace }

    const contracts = Object.assign(
      {
        V00_UserRegistry,
        ClaimHolderRegistered,
        ClaimHolderPresigned,
        OriginIdentity,
        OriginToken
      },
      this.marketplaceContracts
    )

    this.libraries = {}
    this.libraries.ClaimHolderLibrary = ClaimHolderLibrary
    this.libraries.KeyHolderLibrary = KeyHolderLibrary
    this.contracts = {}
    for (const name in contracts) {
      this.contracts[name] = contracts[name]
      try {
        this.contracts[name].networks = Object.assign(
          {},
          this.contracts[name].networks,
          contractAddresses[name]
        )
      } catch (e) {
        /* Ignore */
      }
    }
  }

  async currencies() {
    // use cached value if available
    if (!this._currencies) {
      const currenciesList = await Promise.all(SUPPORTED_ERC20.map(async (token) => {
        const deployed = await this.deployed(this.contracts[token.contractName])
        const address = deployed.options.address
        const obj = {}
        obj[token.symbol] = {
          address,
          decimals: token.decimals
        }
        return obj
      }))
      const currenciesObj = currenciesList.reduce((acc, cur) => {
        return Object.assign(acc, cur)
      }, {})
      this._currencies = Object.assign(
        { ETH: { address: emptyAddress } },
        currenciesObj
      )
    }
    return this._currencies
  }

  // Returns an object that describes how many marketplace
  // contracts are available.
  async marketplaceContractsFound() {
    const networkId = await web3.eth.net.getId()

    const contractCount = Object.keys(this.marketplaceContracts).length
    const contractsFound = Object.keys(this.marketplaceContracts).filter(
      contractName =>
        this.marketplaceContracts[contractName].networks[networkId]
    ).length

    return {
      allContractsPresent: contractCount === contractsFound,
      someContractsPresent: contractsFound > 0
    }
  }

  // Return bytes32 hex string from base58 encoded ipfs hash,
  // stripping leading 2 bytes from 34 byte IPFS hash
  // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
  // E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
  // "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
  getBytes32FromIpfsHash(ipfsListing) {
    return (
      '0x' +
      bs58
        .decode(ipfsListing)
        .slice(2)
        .toString('hex')
    )
  }

  // Return base58 encoded ipfs hash from bytes32 hex string,
  // E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
  // --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"
  getIpfsHashFromBytes32(bytes32Hex) {
    // Add our default ipfs values for first 2 bytes:
    // function:0x12=sha2, size:0x20=256 bits
    // and cut off leading "0x"
    const hashHex = '1220' + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex')
    const hashStr = bs58.encode(hashBytes)
    return hashStr
  }

  // Returns the first account listed, unless a default account has been set
  // explicitly
  async currentAccount() {
    const defaultAccount = this.web3.eth.defaultAccount
    if (defaultAccount) {
      return defaultAccount
    } else {
      const accounts = await this.web3.eth.getAccounts()
      return accounts[0]
    }
  }

  // async convenience method for getting block details
  getBlock(blockHash) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBlock(blockHash, (error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }

  async getTimestamp(event) {
    const { timestamp } = await this.getBlock(event.blockHash)
    return timestamp
  }

  // async convenience method for getting transaction details
  getTransaction(transactionHash) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getTransaction(transactionHash, (error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }

  async deployed(contract, addrs) {
    const net = await this.web3.eth.net.getId()
    const storedAddress =
      contract.networks[net] && contract.networks[net].address
    addrs = addrs || storedAddress || null
    return new this.web3.eth.Contract(contract.abi, addrs)
  }

  async getBytecode(contract) {
    const net = await this.web3.eth.net.getId()
    const bytecode = contract.bytecode
    const withLibraryAddresses = bytecode.replace(/__[^_]+_+/g, matchedStr => {
      const libraryName = matchedStr.replace(/_/g, '')
      const library = this.libraries[libraryName]
      const libraryAddress =
        library.networks[net] && library.networks[net].address
      const withoutPrefix = libraryAddress.slice(2)
      return withoutPrefix
    })
    return withLibraryAddresses
  }

  async deploy(contract, args, options, { confirmationCallback, transactionHashCallback } = {} ) {
    const bytecode = await this.getBytecode(contract)
    const deployed = await this.deployed(contract)
    const txReceipt = await new Promise((resolve, reject) => {
      deployed
        .deploy({
          data: bytecode,
          arguments: args
        })
        .send(options)
        .on('receipt', receipt => {
          resolve(receipt)
        })
        //.on('confirmation', confirmationCallback)
        //.on('transactionHash', transactionHashCallback)
        // Workaround for "confirmationCallback" not being triggered with web3 version:1.0.0-beta.34
        .on('transactionHash', (hash) => {
          if (transactionHashCallback)
            transactionHashCallback(hash)
          if (confirmationCallback)
            this.checkForDeploymentCompletion(hash, confirmationCallback)
        })
        .on('error', err => reject(err))
    })
    return txReceipt
  }

  /* confirmation callback does not get triggered in current version of web3 version:1.0.0-beta.34
   * so this function perpetually (until 20 confirmations) checks for presence of deployed contract.
   *
   * This could also be a problem in Ethereum node: https://github.com/ethereum/web3.js/issues/1255
   */
  async checkForDeploymentCompletion(hash, confirmationCallback) {
    const transactionInfo = await this.web3.eth.getTransaction(hash)

    // transaction not mined
    if (transactionInfo.blockNumber === null){
      setTimeout(() => {
        this.checkForDeploymentCompletion(hash, confirmationCallback)
      }, 1500)
    } else {
      const currentBlockNumber = await this.web3.eth.getBlockNumber()
      const confirmations = currentBlockNumber - transactionInfo.blockNumber
      confirmationCallback(confirmations, {
        transactionHash: transactionInfo.hash
      })
      // do checks until NUMBER_CONFIRMATIONS_TO_REPORT block confirmations
      if (confirmations < NUMBER_CONFIRMATIONS_TO_REPORT) {
        setTimeout(() => {
          this.checkForDeploymentCompletion(hash, confirmationCallback)
        }, 1500)
      }
    }
  }

  async call(
    contractName,
    functionName,
    args = [],
    { contractAddress, from, gas, value, confirmationCallback, transactionHashCallback, additionalGas = 0 } = {}
  ) {
    const contractDefinition = this.contracts[contractName]
    if (typeof contractDefinition === 'undefined') {
      throw new Error(
        `Contract not defined on contract service: ${contractName}`
      )
    }
    // Setup options
    const opts = { from, gas, value }
    opts.from = opts.from || (await this.currentAccount())
    // Get contract and run trasaction
    const contract = await this.deployed(contractDefinition)
    contract.options.address = contractAddress || contract.options.address
    const method = contract.methods[functionName].apply(contract, args)
    if (method._method.constant) {
      return await method.call(opts)
    }
    // set gas
    opts.gas = (opts.gas || (await method.estimateGas(opts))) + additionalGas
    const transactionReceipt = await new Promise((resolve, reject) => {
      method
        .send(opts)
        .on('receipt', resolve)
        .on('confirmation', confirmationCallback)
        .on('transactionHash', transactionHashCallback)
        .on('error', reject)
    })
    const block = await this.web3.eth.getBlock(transactionReceipt.blockNumber)
    return {
      // return current time in seconds if block is not found
      timestamp: block ? block.timestamp : Math.floor(Date.now() / 1000),
      transactionReceipt
    }
  }

  // Convert money object to correct units for blockchain
  async moneyToUnits(money) {
    if (money.currency === 'ETH') {
      return Web3.utils.toWei(money.amount, 'ether')
    } else {
      const currencies = await this.currencies()
      const currency = currencies[money.currency]
      // handle ERC20
      // TODO consider using ERCStandardDetailed.decimals() (for tokens that support this) so that we don't have to track decimals ourselves
      // https://github.com/OpenZeppelin/openzeppelin-solidity/blob/6c4c8989b399510a66d8b98ad75a0979482436d2/contracts/token/ERC20/ERC20Detailed.sol
      const currencyDecimals = currency && currency.decimals
      if (currencyDecimals) {
        const scaling = BigNumber(10).exponentiatedBy(currencyDecimals)
        return BigNumber(money.amount).multipliedBy(scaling).toString()
      } else {
        return money.amount
      }
    }
  }
}

export default ContractService
