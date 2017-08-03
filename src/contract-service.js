import ListingContract from '../build/contracts/Listing.json'
import web3Service from './utils/web3-service'

class ContractService {

  static instance;

  constructor() {
    if (ContractService.instance) {
      return ContractService.instance;
    }

    ContractService.instance = this;

    this.contract = require('truffle-contract');
    this.listingContract = this.contract(ListingContract);
  }

  getListingForAddress(address) {
    this.listingContract.deployed().then((instance) => {
      return instance.listingFromAddress(address);
    }).then((result) => {
      console.log(result);
    });
  }

  getListingForUser() {
    this.listingContract.setProvider(web3Service.web3.currentProvider);
    web3Service.web3.eth.getAccounts((error, accounts) => {
      this.getListingForAddress(accounts[0])
    });
  }

  submitListing(ipfsListing) {
    // Temporary stub hash    
    let sampleIpfsHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";

    this.listingContract.setProvider(web3Service.web3.currentProvider);
    web3Service.web3.eth.getAccounts((error, accounts) => {
      this.listingContract.deployed().then((instance) => {
        return instance.create(sampleIpfsHash, {from: accounts[0]});
      }).then((result) => {
        console.log(result);
        // Temporary check to see if value is stored
        this.getListingForUser();
      });
    });
  }
}

let contractService = new ContractService();

export default contractService;


