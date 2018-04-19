import ContractService from "./contract-service"
import IpfsService from "./ipfs-service"
import UserRegistryService from "./user-registry-service"

var resources = {
  listings: require("./resources/listings"),
  purchases: require("./resources/purchases")
}

class Origin {
  constructor({
    ipfsDomain,
    ipfsApiPort,
    ipfsGatewayPort,
    ipfsGatewayProtocol
  } = {}) {
    this.contractService = new ContractService()
    this.ipfsService = new IpfsService({
      ipfsDomain,
      ipfsApiPort,
      ipfsGatewayPort,
      ipfsGatewayProtocol
    })

    // TODO: This service is deprecated. Remove once the demo dapp no longer
    // depends on it.
    this.userRegistryService = new UserRegistryService()

    // Instantiate each resource and give it access to contracts and IPFS
    for (let resourceName in resources) {
      let Resource = resources[resourceName]
      // A `Resource` constructor always takes a contractService and ipfsService
      this[resourceName] = new Resource({
        contractService: this.contractService,
        ipfsService: this.ipfsService
      })
    }
  }
}

module.exports = Origin
