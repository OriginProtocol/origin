import ListingsRegistryContract from '../../contracts/build/contracts/ListingsRegistry.json'
import ListingContract from '../../contracts/build/contracts/Listing.json'
import UserRegistryContract from '../../contracts/build/contracts/UserRegistry.json'
import bs58 from 'bs58'
import contract from 'truffle-contract'
import promisify from 'util.promisify'

class ContractService {
  constructor() {
    this.listingsRegistryContract = contract(ListingsRegistryContract)
    this.listingContract = contract(ListingContract)
    this.userRegistryContract = contract(UserRegistryContract)
  }

  // Return bytes32 hex string from base58 encoded ipfs hash,
  // stripping leading 2 bytes from 34 byte IPFS hash
  // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
  // E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
  // "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
  getBytes32FromIpfsHash(ipfsListing) {
    return '0x'+bs58.decode(ipfsListing).slice(2).toString('hex')
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

  async submitListing(ipfsListing, ethPrice, units) {
    try {
      const { currentProvider, eth } = window.web3;
      this.listingsRegistryContract.setProvider(currentProvider)

      const accounts = await promisify(eth.getAccounts.bind(eth))()
      const instance = await this.listingsRegistryContract.deployed()

      const weiToGive = window.web3.toWei(ethPrice, 'ether')
      // Note we cannot get the listingId returned by our contract.
      // See: https://forum.ethereum.org/discussion/comment/31529/#Comment_31529
      return instance.create(
        this.getBytes32FromIpfsHash(ipfsListing),
        weiToGive,
        units,
        {from: accounts[0]})
    } catch (error) {
      console.error('Error submitting to the Ethereum blockchain: ' + error)
      throw error
    }
  }

  async getAllListingIds() {
    const range = (start, count) => (
      Array.apply(0, Array(count))
        .map((element, index) => index + start)
    )

    this.listingsRegistryContract.setProvider(window.web3.currentProvider)

    let instance
    try {
      instance = await this.listingsRegistryContract.deployed()
    } catch (error) {
      console.log(`Contract not deployed`)
      throw error
    }

    // Get total number of listings
    let listingsLength
    try {
      listingsLength = await instance.listingsLength.call()
    } catch (error) {
      console.log(error)
      console.log(`Can't get number of listings.`)
      throw error
    }

    return range(0, Number(listingsLength))
  }

  async getListing(listingId) {
    this.listingsRegistryContract.setProvider(window.web3.currentProvider)
    const instance = await this.listingsRegistryContract.deployed()

    let listing
    try {
      listing = await instance.getListing.call(listingId)
    } catch (error) {
      console.log(`Error fetching listingId: ${listingId}`)
      throw error
    }

    // Listing is returned as array of properties.
    // IPFS hash (as bytes32 hex string) is in results[2]
    // Convert it to regular IPFS base-58 encoded hash
    // Address of Listing contract is in: listing[0]
    const listingObject = {
      index: listingId,
      address: listing[0],
      lister: listing[1],
      ipfsHash: this.getIpfsHashFromBytes32(listing[2]),
      price: window.web3.fromWei(listing[3], 'ether').toNumber(),
      unitsAvailable: listing[4].toNumber()
    }
    return listingObject
  }

  async buyListing(listingAddress, unitsToBuy, ethToGive) {
    // TODO: Shouldn't we be passing wei to this function, not eth?
    console.log('request to buy listing ' + listingAddress + ', for this many units ' + unitsToBuy + ' units. Total eth to send:' + ethToGive)

    const { currentProvider, eth } = window.web3;
    this.listingContract.setProvider(currentProvider)

    const accounts = await promisify(eth.getAccounts.bind(eth))()
    const listing = await this.listingContract.at(listingAddress)
    const weiToGive = window.web3.toWei(ethToGive, 'ether')
    
    const transactionReceipt = await listing.buyListing(
      unitsToBuy,
      {from: accounts[0], value:weiToGive, gas: 4476768} // TODO (SRJ): is gas needed?
    )
    return transactionReceipt
  }

  async waitTransactionFinished(transactionReceipt, pollIntervalMilliseconds=1000) {
    console.log("Waiting for transaction")
    console.log(transactionReceipt)
    const blockNumber = await new Promise((resolve, reject) => {
      if (!transactionHash) {
        reject(`Invalid transactionHash passed: ${transactionHash}`)
      }
      let txCheckTimer = setInterval(txCheckTimerCallback, pollIntervalMilliseconds)
      function txCheckTimerCallback() {
        window.web3.eth.getTransaction(transactionHash, (error, transaction) => {
          if (transaction.blockNumber != null) {
            console.log(`Transaction mined at block ${transaction.blockNumber}`)
            console.log(transaction)
            // TODO: Wait maximum number of blocks
            // TODO: Confirm transaction *sucessful* with getTransactionReceipt()

            // // TODO (Stan): Metamask web3 doesn't have this method. Probably could fix by
            // // by doing the "copy local web3 over metamask's" technique.
            // window.web3.eth.getTransactionReceipt(this.props.transactionHash, (error, transactionHash) => {
            //   console.log(transactionHash)
            // })

            clearInterval(txCheckTimer)
            // Hack to wait two seconds, as results don't seem to be
            // immediately available.
            setTimeout(()=>resolve(transaction.blockNumber), 2000)
          }
        })
      }
    })
    return blockNumber
  }
}

export default ContractService
