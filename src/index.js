import ContractService from './services/contract-service'
import IpfsService from './services/ipfs-service'
import { Attestations } from './resources/attestations'
import Listings from './resources/listings'
import Notifications from './resources/notifications'
import Purchases from './resources/purchases'
import Reviews from './resources/reviews'
import Users from './resources/users'
import fetch from 'cross-fetch'
import store from 'store'

const defaultBridgeServer = 'https://bridge.originprotocol.com'
const defaultIpfsDomain = 'gateway.originprotocol.com'
const defaultIpfsApiPort = '5002'
const defaultIpfsGatewayPort = '443'
const defaultIpfsGatewayProtocol = 'https'
const defaultAttestationServerUrl = `${defaultBridgeServer}/api/attestations`
const defaultIndexingServerUrl = `${defaultBridgeServer}/api`

class Origin {
  constructor({
    ipfsDomain = defaultIpfsDomain,
    ipfsApiPort = defaultIpfsApiPort,
    ipfsGatewayPort = defaultIpfsGatewayPort,
    ipfsGatewayProtocol = defaultIpfsGatewayProtocol,
    attestationServerUrl = defaultAttestationServerUrl,
    indexingServerUrl = defaultIndexingServerUrl,
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

    this.listings = new Listings({
      contractService: this.contractService,
      ipfsService: this.ipfsService,
      indexingServerUrl,
      fetch
    })

    this.purchases = new Purchases({
      contractService: this.contractService,
      ipfsService: this.ipfsService
    })

    this.notifications = new Notifications({
      listings: this.listings,
      purchases: this.purchases,
      contractService: this.contractService,
      store
    })

    this.reviews = new Reviews({
      contractService: this.contractService,
      ipfsService: this.ipfsService
    })

    this.users = new Users({
      contractService: this.contractService,
      ipfsService: this.ipfsService
    })
  }
}

module.exports = Origin
