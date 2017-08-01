import getWeb3 from './utils/getWeb3'

class ContractService {

  static instance;

  constructor() {
    if (ContractService.instance) {
      return ContractService.instance;
    }

    ContractService.instance = this;
  }

  submitListing(ipfsListing) {
    console.log("Promise worked - Append ipfs reference link to wallet address in hash table");
    console.log(ipfsListing);
  }
}

let contractService = new ContractService()

export default contractService