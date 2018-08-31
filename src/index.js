import ContractService from './services/contract-service'
import IpfsService from './services/ipfs-service'
import { Attestations } from './resources/attestations'
import Marketplace from './resources/marketplace'
import Users from './resources/users'
import Messaging from './resources/messaging'
import fetch from 'cross-fetch'
import store from 'store'

const defaultBridgeServer = 'https://bridge.originprotocol.com'
const defaultIpfsDomain = 'gateway.originprotocol.com'
const defaultIpfsApiPort = '5002'
const defaultIpfsGatewayPort = '443'
const defaultIpfsGatewayProtocol = 'https'
const defaultAttestationServerUrl = `${defaultBridgeServer}/api/attestations`
const defaultIndexingServerUrl = `${defaultBridgeServer}/api`
const VERSION = require('.././package.json').version

class Origin {
  constructor({
    ipfsDomain = defaultIpfsDomain,
    ipfsApiPort = defaultIpfsApiPort,
    ipfsGatewayPort = defaultIpfsGatewayPort,
    ipfsGatewayProtocol = defaultIpfsGatewayProtocol,
    attestationServerUrl = defaultAttestationServerUrl,
    indexingServerUrl = defaultIndexingServerUrl,
    contractAddresses,
    web3,
    ipfsCreator,
    OrbitDB,
    ecies,
    messagingNamespace
  } = {}) {
    this.version = VERSION

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

    this.marketplace = new Marketplace({
      contractService: this.contractService,
      ipfsService: this.ipfsService,
      indexingServerUrl,
      fetch,
      store
    })

    this.users = new Users({
      contractService: this.contractService,
      ipfsService: this.ipfsService
    })

    this.messaging = new Messaging({
      contractService: this.contractService,
      ipfsCreator,
      OrbitDB,
      ecies,
      messagingNamespace
    })
  }
}

module.exports = Origin
