import ClaimHolderRegisteredContract from './../../contracts/build/contracts/ClaimHolderRegistered.json'
import ClaimHolderPresignedContract from './../../contracts/build/contracts/ClaimHolderPresigned.json'
import ClaimHolderLibrary from './../../contracts/build/contracts/ClaimHolderLibrary.json'
import KeyHolderLibrary from './../../contracts/build/contracts/KeyHolderLibrary.json'
import PurchaseLibrary from './../../contracts/build/contracts/PurchaseLibrary.json'
import ListingsRegistryContract from './../../contracts/build/contracts/ListingsRegistry.json'
import ListingsRegistryStorageContract from './../../contracts/build/contracts/ListingsRegistryStorage.json'
import ListingContract from './../../contracts/build/contracts/Listing.json'
import UnitListingContract from './../../contracts/build/contracts/UnitListing.json'
import FractionalListingContract from './../../contracts/build/contracts/FractionalListing.json'
import PurchaseContract from './../../contracts/build/contracts/Purchase.json'
import UserRegistryContract from './../../contracts/build/contracts/UserRegistry.json'
import OriginIdentityContract from './../../contracts/build/contracts/OriginIdentity.json'
import bs58 from 'bs58'
import Web3 from 'web3'

class ContractService {
  constructor(options = {}) {
    const externalWeb3 = options.web3 || window.web3
    if (!externalWeb3) {
      throw new Error(
        'web3 is required for Origin.js. Please pass in web3 as a config option.'
      )
    }
    this.web3 = new Web3(externalWeb3.currentProvider)

    const contracts = {
      listingContract: ListingContract,
      listingsRegistryContract: ListingsRegistryContract,
      listingsRegistryStorageContract: ListingsRegistryStorageContract,
      unitListingContract: UnitListingContract,
      fractionalListingContract: FractionalListingContract,
      purchaseContract: PurchaseContract,
      userRegistryContract: UserRegistryContract,
      claimHolderRegisteredContract: ClaimHolderRegisteredContract,
      claimHolderPresignedContract: ClaimHolderPresignedContract,
      originIdentityContract: OriginIdentityContract
    }
    this.libraries = {}
    this.libraries.ClaimHolderLibrary = ClaimHolderLibrary
    this.libraries.KeyHolderLibrary = KeyHolderLibrary
    this.libraries.PurchaseLibrary = PurchaseLibrary
    for (const name in contracts) {
      this[name] = contracts[name]
      try {
        this[name].networks = Object.assign(
          {},
          this[name].networks,
          options.contractAddresses[name]
        )
      } catch (e) {
        /* Ignore */
      }
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
    const accounts = await this.web3.eth.getAccounts()
    const defaultAccount = this.web3.eth.defaultAccount
    return defaultAccount || accounts[0]
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

  async deploy(contract, args, options) {
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
        .on('error', err => reject(err))
    })
    return txReceipt
  }

  async waitTransactionFinished(
    transactionHash,
    pollIntervalMilliseconds = 1000
  ) {
    console.log('Waiting for transaction')
    console.log(transactionHash)
    const blockNumber = await new Promise((resolve, reject) => {
      if (!transactionHash) {
        reject(`Invalid transactionHash passed: ${transactionHash}`)
        return
      }
      let txCheckTimer = null
      const txCheckTimerCallback = () => {
        this.web3.eth.getTransaction(transactionHash, (error, transaction) => {
          if (transaction.blockNumber != null) {
            console.log(`Transaction mined at block ${transaction.blockNumber}`)
            // TODO: Wait maximum number of blocks
            // TODO (Stan): Confirm transaction *sucessful* with getTransactionReceipt()

            // // TODO (Stan): Metamask web3 doesn't have this method. Probably could fix by
            // // by doing the "copy local web3 over metamask's" technique.
            // this.web3.eth.getTransactionReceipt(this.props.transactionHash, (error, transactionHash) => {
            //   console.log(transactionHash)
            // })

            clearInterval(txCheckTimer)
            // Hack to wait two seconds, as results don't seem to be
            // immediately available.
            setTimeout(() => resolve(transaction.blockNumber), 2000)
          }
        })
      }

      txCheckTimer = setInterval(txCheckTimerCallback, pollIntervalMilliseconds)
    })
    return blockNumber
  }

  async contractFn(
    contractDefinition,
    address,
    functionName,
    args = [],
    options = {},
    confirmationCallback
  ) {
    // Setup options
    const opts = Object.assign(options, {}) // clone options
    opts.from = opts.from || (await this.currentAccount())
    opts.gas = options.gas || 50000 // Default gas
    // Get contract and run trasaction
    const contract = await this.deployed(contractDefinition)
    contract.options.address = address || contract.options.address

    const method = contract.methods[functionName].apply(contract, args)
    if (method._method.constant) {
      return await method.call(opts)
    }
    const transaction = await new Promise((resolve, reject) => {
      method
        .send(opts)
        .on('receipt', receipt => {
          resolve(receipt)
        })
        .on('confirmation', confirmationNumber => {
          if (confirmationCallback) {
            confirmationCallback(confirmationNumber)
          }
        })
        .on('error', err => reject(err))
    })

    transaction.tx = transaction.transactionHash
    // Decorate transaction with whenFinished promise
    if (transaction.tx !== undefined) {
      transaction.whenFinished = async () => {
        await this.waitTransactionFinished(transaction.tx)
      }
    }
    return transaction
  }
}

export default ContractService
