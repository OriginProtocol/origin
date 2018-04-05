import ContractService from "./contract-service"
import IpfsService from "./ipfs-service"
import OriginService from "./origin-service"
import UserRegistryService from "./user-registry-service"

var resources = {
  listings: require("./resources/listings")
}

class Origin {
  constructor() {
    this.contractService = new ContractService()
    this.ipfsService = new IpfsService()
    this.originService = new OriginService({
      contractService: this.contractService,
      ipfsService: this.ipfsService
    })
    this.userRegistryService = new UserRegistryService()

    // Instantiate each resource and give it access to contracts and IPFS
    for (let resourceName in resources) {
      let Resource = resources[resourceName]
      this[resourceName] = new Resource({
        contractService: this.contractService,
        ipfsService: this.ipfsService
      })
    }
  }
}

module.exports = Origin
