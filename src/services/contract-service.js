import ListingContract from '../../build/contracts/Listing.json'
import web3Service from './web3-service'

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

  // Re-write as promise
  getListingForAddress(address) {
    this.listingContract.deployed().then((instance) => {
      return instance.listingForAddress(address)
    }).then((result) => {
      console.log(result)
    });
  }

  // Re-wire as promise
  getListingForUser() {
    this.listingContract.setProvider(web3Service.web3.currentProvider)
    web3Service.web3.eth.getAccounts((error, accounts) => {
      this.getListingForAddress(accounts[0])
    });
  }

  submitListing(ipfsListing) {
    return new Promise((resolve, reject) => {
      this.listingContract.setProvider(web3Service.web3.currentProvider)
      web3Service.web3.eth.getAccounts((error, accounts) => {
        this.listingContract.deployed().then((instance) => {
          return instance.create(ipfsListing, {from: accounts[0]})
        }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject('Error submitting to the Ethereum blockchain: ' + error)
        })
      })
    })
  }
}

const contractService = new ContractService()

export default contractService


