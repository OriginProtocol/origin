import ListingContract from '../../build/contracts/Listing.json'
import web3Service from './web3-service'
import bs58 from 'bs58'

class ContractService {
  static instance

  constructor() {
    if (ContractService.instance) {
      return ContractService.instance
    }

    ContractService.instance = this;

    this.contract = require('truffle-contract')
    this.listingContract = this.contract(ListingContract)
  }

  // Return bytes32 hex string from base58 encoded ipfs hash,
  // stripping leading 2 bytes from 34 byte IPFS hash
  // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
  // E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
  // "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
  getBytes32FromIpfsHash(ipfsListing) {
    return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
  }

  // Return base58 encoded ipfs hash from bytes32 hex string,
  // E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
  // --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"
  getIpfsHashFromBytes32(bytes32Hex) {
    // Add our default ipfs values for first 2 bytes:
    // function:0x12=sha2, size:0x20=256 bits
    // and cut off leading "0x"
    const hashHex = "12" + "20" + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex');
    const hashStr = bs58.encode(hashBytes)
    return hashStr
  }

  getListingForAddress(address) {
    return new Promise((resolve, reject) => {
      this.listingContract.deployed().then((instance) => {
        return instance.listingForAddress(address)
      }).then((result) => {
        resolve(result)
      }).catch((error) => {
        console.error('Error getting listing for Ethereum address: ' + error)
        reject(error)
      })
    })
  }

  getListingForUser() {
    this.listingContract.setProvider(web3Service.web3.currentProvider)
    web3Service.web3.eth.getAccounts((error, accounts) => {
      return this.getListingForAddress(accounts[0])
    })
  }

  submitListing(ipfsListing) {
    return new Promise((resolve, reject) => {
      this.listingContract.setProvider(web3Service.web3.currentProvider)
      web3Service.web3.eth.getAccounts((error, accounts) => {
        this.listingContract.deployed().then((instance) => {
          return instance.create(this.getBytes32FromIpfsHash(ipfsListing), 1.0, 1.0, {from: accounts[0]})
        }).then((result) => {
          resolve(result)
        }).catch((error) => {
          console.error("Error submitting to the Ethereum blockchain: " + error)
          reject(error)
        })
      })
    })
  }

  getAllListings() {
    return new Promise((resolve, reject) => {
      this.listingContract.setProvider(web3Service.web3.currentProvider)
        this.listingContract.deployed().then((instance) => {
          // Get total number of listings
          instance.listingsLength.call().then((listingsLength) => {
            let that = this
            let listings = []
            let getListingPromises = []
            // TODO: Paging over listings to get only subsets
            for (var i = 0; i < listingsLength; i++) {
              getListingPromises[i] = new Promise((resolve) => {
                instance.getListing.call(i).then((listing)  => {
                  // Listing is returned as array of properties.
                  // IPFS hash (as bytes32 hex string) is in results[2]
                  // Convert it to regular IPFS base-58 encoded hash
                  var listingObject = {
                    index: listing[0].toNumber(),
                    lister: listing[1],
                    ipfsHash: that.getIpfsHashFromBytes32(listing[2]),
                    price: listing[3].toNumber(),
                    unitsAvailable: listing[4].toNumber()
                  }
                  console.log("New listing. Index:" + listing[0].toNumber())
                  console.log(listingObject)
                  listings[listingObject.index] = listingObject
                  resolve()
                });
              });
            }
            // Resolve outer promise when we're all done getting all listings
            Promise.all(getListingPromises).then(() => {
              resolve(listings)
            });
          });
        })
    })
  }

}

const contractService = new ContractService()

export default contractService


