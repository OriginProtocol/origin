import ContractService from "./contract-service"
import IpfsService from "./ipfs-service"
import OriginService from "./origin-service"
import UserRegistryService from "./user-registry-service"

var resources = {
  listings: require("./resources/listings")
}

class Origin {
  constructor() {
    // Give each resource access to the origin services.
    // By having a single origin, its configuration can be changed
    // and all contracts will follow it
    for (let resourceName in resources) {
      resources[resourceName].origin = this
      this[resourceName] = resources[resourceName]
    }
    this.contractService = new ContractService()
    this.ipfsService = new IpfsService()
    this.originService = new OriginService({
      contractService: this.contractService,
      ipfsService: this.ipfsService
    })
    this.userRegistryService = new UserRegistryService()
  }
}

module.exports = Origin
