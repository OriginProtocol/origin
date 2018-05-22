import ContractService from "./services/contract-service"
import IpfsService from "./services/ipfs-service"
import { Attestations } from "./resources/attestations"
import Users from "./resources/users"
import fetch from "cross-fetch"

var resources = {
  listings: require("./resources/listings"),
  purchases: require("./resources/purchases"),
  reviews: require("./resources/reviews"),
  users: require("./resources/users")
}

const defaultBridgeServer = "https://bridge.originprotocol.com"
const defaultIpfsDomain = "gateway.originprotocol.com"
const defaultIpfsApiPort = "5002"
const defaultIpfsGatewayPort = "443"
const defaultIpfsGatewayProtocol = "https"
const defaultAttestationServerUrl = `${defaultBridgeServer}/api/attestations`

class Origin {
  constructor({
    ipfsDomain = defaultIpfsDomain,
    ipfsApiPort = defaultIpfsApiPort,
    ipfsGatewayPort = defaultIpfsGatewayPort,
    ipfsGatewayProtocol = defaultIpfsGatewayProtocol,
    attestationServerUrl = defaultAttestationServerUrl,
    contractAddresses,
    web3
  } = {}) {
    this.contractService = new ContractService({ contractAddresses, web3 })
    this.ipfsService = new IpfsService({
      ipfsDomain,
      ipfsApiPort,
      ipfsGatewayPort,
      ipfsGatewayProtocol
    })
    this.attestations = new Attestations({
      serverUrl: attestationServerUrl,
      contractService: this.contractService,
      fetch
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
