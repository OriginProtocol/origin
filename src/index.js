import ContractService from "./contract-service"
import IpfsService from "./ipfs-service"
import { Attestations } from "./resources/attestations"
import Users from "./resources/users"

var resources = {
  listings: require("./resources/listings"),
  purchases: require("./resources/purchases")
}

class Origin {
  constructor({
    ipfsDomain,
    ipfsApiPort,
    ipfsGatewayPort,
    ipfsGatewayProtocol,
    attestationServerUrl,
    attestationIssuer
  } = {}) {
    this.contractService = new ContractService()
    this.ipfsService = new IpfsService({
      ipfsDomain,
      ipfsApiPort,
      ipfsGatewayPort,
      ipfsGatewayProtocol
    })
    this.attestations = new Attestations({
      serverUrl: attestationServerUrl,
      issuer: attestationIssuer,
      contractService: this.contractService
    })
    this.users = new Users({
      contractService: this.contractService,
      ipfsService: this.ipfsService,
      issuer: attestationIssuer
    })

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
