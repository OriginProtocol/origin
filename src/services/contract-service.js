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

  // Strip leading 2 bytes from 34 byte IPFS hash
  getBytes32FromIpfsHash(ipfsListing) {
    // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
    return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
  }

  getIpfsHashFromBytes32(bytes32Hex) {
    // Add our default ipfs values for first 2 bytes:  function:0x12=sha2, size:0x20=256 bits
    const testHashHex = "12" + "20" + bytes32Hex.slice(2)
    const testHashBytes = Buffer.from(testHashHex, 'hex');
    const testHashStr = bs58.encode(testHashBytes)
    return testHashStr
  }

  getListingForAddress(address) {
    return new Promise((resolve, reject) => {
      this.listingContract.deployed().then((instance) => {
        return instance.listingForAddress(address)
      }).then((result) => {
        resolve(result)
      }).catch((error) => {
        reject('Error getting listing for Ethereum address: ' + error)
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
          reject('Error submitting to the Ethereum blockchain: ' + error)
        })
      })
    })
  }

  getAllListings() {
    return new Promise((resolve, reject) => {
      this.listingContract.setProvider(web3Service.web3.currentProvider)
        this.listingContract.deployed().then((instance) => {

          console.log("About to get listings length")
          instance.listingsLength.call().then((listingsLength) => {
            console.log("listingsLength: " + listingsLength)

            let allResults = []
            let that = this

            function asyncFunction (index, cb) {
              instance.getListing.call(index).then((results)  => {
                results[2] = that.getIpfsHashFromBytes32(results[2])
                let index = results[0]
                let listerAddress = results[1]
                let ipfsHash = results[2]
                let price = results[3]
                let unitsAvailable = results[4]
                console.log(
                  "Index:" + index.toNumber(),
                  "listerAddress:" + listerAddress,
                  "ipfsHash:" + ipfsHash,
                  "price:" + price.toNumber(),
                  "unitsAvailable:" + unitsAvailable.toNumber()
                )

                allResults[index] = results
                cb()
              });
            }

            let requests = []
            for (var i = 0; i < listingsLength; i++) {
              requests[i] = new Promise((resolve) => {
                  asyncFunction(i, resolve)
                });
            }

            Promise.all(requests).then(() => {
              console.log('done')
              console.log(allResults)
              resolve(allResults)
            });

          });
        })
    })
  }

}

const contractService = new ContractService()

export default contractService


