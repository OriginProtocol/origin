import ClaimHolderRegistered from '@origin/contracts/build/contracts/ClaimHolderRegistered.json'
import ClaimHolderPresigned from '@origin/contracts/build/contracts/ClaimHolderPresigned.json'
import ClaimHolderLibrary from '@origin/contracts/build/contracts/ClaimHolderLibrary.json'
import KeyHolderLibrary from '@origin/contracts/build/contracts/KeyHolderLibrary.json'
import V00_UserRegistry from '@origin/contracts/build/contracts/V00_UserRegistry.json'
import IdentityEvents from '@origin/contracts/build/contracts/IdentityEvents.json'
import OriginIdentity from '@origin/contracts/build/contracts/OriginIdentity.json'
import OriginToken from '@origin/contracts/build/contracts/OriginToken.json'

import V00_Marketplace from '@origin/contracts/build/contracts/V00_Marketplace.json'
import VA_Marketplace from '@origin/contracts/build/contracts/VA_Marketplace.json'

import WalletLinker from './../resources/wallet-linker'

import BigNumber from 'bignumber.js'
import bs58 from 'bs58'
import Web3 from 'web3'
import { groupBy, mapValues } from './../utils/arrayFunctions'
import { listingToSignData, acceptOfferToSignData, finalizeToSignData } from '@origin/contracts/sig_schema'

const emptyAddress = '0x0000000000000000000000000000000000000000'
const signSalt = '0x0000000000000000000000000000000000000000000000000000000000000666'
// 24 is the number web3 supplies
const NUMBER_CONFIRMATIONS_TO_REPORT = 24
const SUPPORTED_ERC20 = [
  { symbol: 'OGN', decimals: 18, contractName: 'OriginToken' }
]

class ContractService {
  constructor({ web3, contractAddresses, ethereum, walletLinkerUrl, activeWalletLinker, fetch, ecies } = {}) {
    const externalWeb3 = web3 || ((typeof window !== 'undefined') && window.web3)
    if (!externalWeb3) {
      throw new Error(
        'web3 is required for Origin.js. Please pass in web3 as a config option.'
      )
    }
    this.web3 = new Web3(externalWeb3.currentProvider)
    this.ethereum = ethereum

    if (walletLinkerUrl && fetch){
      this.initWalletLinker(walletLinkerUrl, fetch, ecies)
    }
    this.activeWalletLinker = activeWalletLinker

    this.marketplaceContracts = { V00_Marketplace, VA_Marketplace }

    const contracts = Object.assign(
      {
        ClaimHolderPresigned,
        ClaimHolderRegistered,
        IdentityEvents,
        OriginIdentity,
        OriginToken,
        V00_UserRegistry,
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

  updateContractAddresses(contractAddresses) {
    for (const name in this.contracts) {
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

  getContractAddresses() {
    const addresses = {}
    for (const name in this.contracts) {
      addresses[name] = this.contracts[name].networks
    }
    return addresses
  }

  newWalletNetwork() {
    this.web3.setProvider(this.walletLinker.getProvider())
    // Fake it till you make it
    this.web3.currentProvider.isOrigin = !this.walletLinker.linked
  }

  isActiveWalletLinker() {
    return this.walletLinker && (this.walletLinker.linked || this.activeWalletLinker)
  }

  initWalletLinker(walletLinkerUrl, fetch, ecies) {
    // if there's no given provider
    // we do it the funny wallet way
    if (this.web3.currentProvider.isOrigin && walletLinkerUrl) {
      if (!this.walletLinker) {
        this.walletLinker = new WalletLinker({
          linkerServerUrl: walletLinkerUrl,
          fetch: fetch,
          networkChangeCb: this.newWalletNetwork.bind(this),
          web3: this.web3,
          ecies
        })
        this.walletLinker.initSession()
      }
    }
  }

  hasWalletLinker() {
    return this.walletLinker
  }

  showLinkPopUp() {
    if (this.walletLinker) {
      this.walletLinker.startLink()
    }
  }

  getMobileWalletLink() {
    if (this.walletLinker)
    {
      return this.walletLinker.getLinkCode()
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

  async enableEthereum() {
    try {
      // Request account access if needed
      await this.ethereum.enable()
      this.ethereumIsEnabled = true
      this.onEthereumEnabled = null
    } catch (error) {
      // User denied account access...
      console.error(`Error enabling ethereum: ${error}`)
    }
  }

  async ensureEthereumIsEnabled() {
    if (this.ethereum && !this.ethereumIsEnabled) {
      // This flow allows currentAccount to be called multiple times before the user has dealt with the first popup.
      // Otherwise, if you call this function multiple times before the first one is handled, mutltiple popups will appear.
      if (!this.onEthereumEnabled) {
        this.onEthereumEnabled = this.enableEthereum()
      }
      await this.onEthereumEnabled
    }
  }

  // Returns the first account listed, unless a default account has been set
  // explicitly
  async currentAccount() {
    await this.ensureEthereumIsEnabled()
    const defaultAccount = this.web3.eth.defaultAccount
    if (defaultAccount) {
      return defaultAccount
    } else {
      const accounts = await this.web3.eth.getAccounts()
      return accounts[0]
    }
  }

  walletPlaceholderAccount() {
    return WalletLinker.PLACEHOLDER_ADDRESS
  }

  placeholderAccount() {
    return this.walletLinker && this.walletPlaceholderAccount()
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

  /* Confirmation callback does not get triggered in some versions of Metamask so this
   * function perpetually (until NUMBER_CONFIRMATIONS_TO_REPORT confirmations) checks
   * for transaction confirmation.
   *
   * This function is a safety net just in case send method's `on.('confirmation')` does
   * not function (e.g. in Metamask 4.12.0 it is broken). But if we detect that the mentioned
   * function is not broken we cancel the safety net immediately.
   */
  async checkForTransactionCompletion(hash, contract, confirmationCallback, resolveCallback, promiseStatus) {
    if (promiseStatus.onConfirmationTriggered)
      return

    const transactionReceipt = await this.web3.eth.getTransactionReceipt(hash)

    // transaction not mined
    if (transactionReceipt === null || transactionReceipt.blockNumber === null){
      setTimeout(() => {
        this.checkForTransactionCompletion(hash, contract, confirmationCallback, resolveCallback, promiseStatus)
      }, 1500)
    } else {
      promiseStatus.txnFoundCounter += 1

      /* If fallback function detects a valid transaction for the second time and the main function has
       * not registered a transaction receipt, positively resolve the promise with generated receipt. This resolves
       * problems created by Metamask 4.12.0.
       */
      if (!promiseStatus.receiptReceived && promiseStatus.txnFoundCounter > 1){
        // unfortunately transaction logs in transactionReceipt do not contain all needed event information
        const getEventsEmittedByTransaction = async () => {
          let events = await contract.getPastEvents(
            'allEvents',
            {
              fromBlock: transactionReceipt.blockNumber
            }
          )

          // only keep event emitted by this transaction
          events = events
            .filter(event => event.transactionHash === transactionReceipt.transactionHash)
          /* Send method returns events grouped by name. (https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send)
           * If more than 1 event of the same name is returned it is an array, otherwise an object.
           * Just conform to that format
           */
          return mapValues(groupBy(events, (event) => event.event),
            eventList => eventList.length === 1 ? eventList[0] : eventList)
        }


        promiseStatus.receiptReceived = true
        transactionReceipt.events = await getEventsEmittedByTransaction()
        resolveCallback(transactionReceipt)
      }

      const currentBlockNumber = await this.web3.eth.getBlockNumber()
      // Math.max to prevent the -1 confirmation on Rinkeby.
      const confirmations = Math.max(0, currentBlockNumber - transactionReceipt.blockNumber)
      if (confirmationCallback !== undefined)
        confirmationCallback(confirmations, transactionReceipt)

      if (confirmations < NUMBER_CONFIRMATIONS_TO_REPORT) {
        setTimeout(() => {
          this.checkForTransactionCompletion(hash, contract, confirmationCallback, resolveCallback, promiseStatus)
        }, 1500)
      }
    }
  }

  // Unify the way contract's transactions/deployments are handled
  handleTransactionCallbacks(contract, sendCallback, resolveCallback, rejectCallback, confirmationCallback, transactionHashCallback) {
    // needs to be an object because it is passed to functions by reference
    const promiseStatus = {
      onConfirmationTriggered: false,
      receiptReceived: false,
      txnFoundCounter: 0
    }
    sendCallback
      .on('receipt', receipt => {
        promiseStatus.receiptReceived = true
        resolveCallback(receipt)
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        promiseStatus.onConfirmationTriggered = true
        if (confirmationCallback)
          confirmationCallback(confirmationNumber, receipt)
      })
      .on('transactionHash', (hash) => {
        if (transactionHashCallback)
          transactionHashCallback(hash)

        /* Start looking for completion even if confirmation callback is undefined. This way if we have a broken Metamask
         * we can still generate a transaction receipt (resolveCallback) even if Metamask does not supply one.
         */
        this.checkForTransactionCompletion(hash, contract, confirmationCallback, resolveCallback, promiseStatus)
      })

      .on('error', error => {
        // an error in Metamask 4.12.0 that we handle with fallback transaction checking function
        if (error.message.includes('Failed to subscribe to new newBlockHeaders to confirm the transaction receipts'))
          return

        rejectCallback(error)
      })
  }

  async deploy(contract, args, options, { confirmationCallback, transactionHashCallback } = {} ) {
    const bytecode = await this.getBytecode(contract)
    const deployed = await this.deployed(contract)
    const txReceipt = await new Promise((resolve, reject) => {
      const sendCallback = deployed
        .deploy({
          data: bytecode,
          arguments: args
        })
        .send(options)

      this.handleTransactionCallbacks(
        contract,
        sendCallback,
        resolve,
        reject,
        confirmationCallback,
        transactionHashCallback
      )
    })
    return txReceipt
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
    //opts.gas = "5000000"
    opts.gas = (opts.gas || (await method.estimateGas(opts))) + additionalGas
    const transactionReceipt = await new Promise((resolve, reject) => {
      if (!opts.from && this.isActiveWalletLinker() && !this.walletLinker.linked) {
        opts.from = this.walletPlaceholderAccount()
      }

      if (this.transactionSigner)
      {
        //This is needed for infura nodes
        opts.data = method.encodeABI()
        opts.to = contract.options.address
        this.transactionSigner(opts).then(sig => {
          const sendCallback = this.web3.eth.sendSignedTransaction(sig.rawTransaction)
          
          this.handleTransactionCallbacks(
            contract,
            sendCallback,
            resolve,
            reject,
            confirmationCallback,
            transactionHashCallback
          )
        })

      } else {
        const sendCallback = method
          .send(opts)

        this.handleTransactionCallbacks(
          contract,
          sendCallback,
          resolve,
          reject,
          confirmationCallback,
          transactionHashCallback
        )
      }

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

  async getSignData(signFunc, ...args) {
    const networkId = await this.web3.eth.net.getId()
    const marketAddress = this.web3.utils.toChecksumAddress(this.marketplaceContracts.VA_Marketplace.networks[networkId].address)
    return signFunc(networkId, marketAddress, signSalt, ...args)
  }

  async getSignListingData(listing) {
    return this.getSignData(listingToSignData, listing)
  }

  async getSignFinalizeData(listingID, offerID, ipfsBytes, payout, verifyFee) {
    return await this.getSignData(finalizeToSignData, listingID, offerID, ipfsBytes, payout, verifyFee)
  }

  async signListing(listing) {
    const signData = await this.getSignListingData(listing)
    return await this.signTypedDataV3(JSON.stringify(signData))
  }

  async signAcceptOfferData(listingID, offerID, ipfsHash, behalfFee) {
    const signData = await this.getSignData(acceptOfferToSignData, listingID, offerID, ipfsHash, behalfFee)
    return await this.signTypedDataV3(JSON.stringify(signData))
  }

  async signFinalizeData(listingID, offerID, ipfsHash, payout, fee) {
    const signData = await this.getSignData(finalizeToSignData, listingID, offerID, ipfsHash, payout, fee)
    return await this.signTypedDataV3(JSON.stringify(signData))
  }
  
  breakdownSig(raw_sig) {
    const signature = raw_sig.substring(2)
    const r = '0x' + signature.substring(0, 64)
    const s = '0x' + signature.substring(64, 128)
    const v = parseInt(signature.substring(128, 130), 16)
    return { r,s,v }
  }

  async signTypedDataV3(data) {
    if (this.isActiveWalletLinker() || this.web3.currentProvider.sendAsync) {
      const signer = await this.currentAccount()
    
      return new Promise((resolve, reject) => { 
        const call = { 
          method: 'eth_signTypedData_v3',
          params: [signer, data],
          from: signer
        }
        const cb = (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result.result)
          }
        }
        if (this.isActiveWalletLinker()) 
        {
          this.walletLinker.sendAsync(call, cb)
        }
        else
        {
          this.web3.currentProvider.sendAsync(call, cb)
        }
      })
    }
  }
}

export default ContractService
