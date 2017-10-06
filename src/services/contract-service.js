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
    // Strip IPFS defaults: function:0x12=sha2, size:0x20=256 bits
    console.log ("Address in hex:" + "0x"+bs58.decode(ipfsListing).slice(2).toString('hex'));
    console.log ("Testing:" + "0x3230313630353238");

    // return web3Service.web3.fromAscii("20160528") // works

    return "0x3230313630353238" // works
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

          // instance.testFunction.call(web3Service.web3.fromAscii("20160528")).then((val) => {
          //   alert(web3Service.web3.toAscii(val))
          // });
    console.log(web3Service.web3.fromAscii("20160528"))

          console.log("About to get listings length")
          instance.listingsLength.call().then((listingsLength) => {
            console.log("listingsLength: " + listingsLength)

            for (var i=0; i<listingsLength; i++) {
              console.log("Get listing detail for listing:" + i)
              instance.getListing.call(i).then((listerAddress, ipfsHash, price, unitsAvailable)  => {
                console.log("Listing " + i + ":");
                console.log(listerAddress, ipfsHash, price, unitsAvailable)
              });

            }


          });


        })
    })
  }

}

const contractService = new ContractService()

export default contractService


