import ContractService from './services/contract-service'
import DiscoveryService from './services/discovery-service'
import IpfsService from './services/ipfs-service'
import { Attestations } from './resources/attestations'
import Marketplace from './resources/marketplace'
import Discovery from './resources/discovery'
import Users from './resources/users'
import Messaging from './resources/messaging'
import Token from './resources/token'
import fetch from 'cross-fetch'
import store from 'store'

const defaultBridgeServer = 'https://bridge.originprotocol.com'
const defaultIpfsDomain = 'gateway.originprotocol.com'
const defaultDiscoveryServerUrl = 'https://discovery.originprotocol.com'
const defaultIpfsApiPort = '5002'
const defaultIpfsGatewayPort = '443'
const defaultIpfsGatewayProtocol = 'https'
const defaultAttestationServerUrl = `${defaultBridgeServer}/api/attestations`
const VERSION = require('.././package.json').version

export default class Origin {
  constructor({
    ipfsDomain = defaultIpfsDomain,
    ipfsApiPort = defaultIpfsApiPort,
    ipfsGatewayPort = defaultIpfsGatewayPort,
    ipfsGatewayProtocol = defaultIpfsGatewayProtocol,
    attestationServerUrl = defaultAttestationServerUrl,
    discoveryServerUrl = defaultDiscoveryServerUrl,
    affiliate,
    arbitrator,
    contractAddresses,
    web3,
    ipfsCreator,
    OrbitDB,
    ecies,
    messagingNamespace,
    blockEpoch,
    blockAttestattionV1,
    ethereum,
    perfModeEnabled
  } = {}) {
    this.version = VERSION

    //
    // Services (Internal, should not be used directly by the Origin client).
    //
    this.contractService = new ContractService({ contractAddresses, web3, ethereum })
    this.ipfsService = new IpfsService({
      ipfsDomain,
      ipfsApiPort,
      ipfsGatewayPort,
      ipfsGatewayProtocol
    })
    this.discoveryService = new DiscoveryService({ discoveryServerUrl, fetch })

    //
    // Resources (External, exposed to the Origin client).
    //
    this.attestations = new Attestations({
      serverUrl: attestationServerUrl,
      contractService: this.contractService,
      fetch,
      blockEpoch
    })

    this.marketplace = new Marketplace({
      contractService: this.contractService,
      discoveryService: this.discoveryService,
      ipfsService: this.ipfsService,
      affiliate,
      arbitrator,
      store,
      blockEpoch,
      perfModeEnabled
    })

    this.discovery = new Discovery({
      discoveryService: this.discoveryService
    })

    this.users = new Users({
      contractService: this.contractService,
      ipfsService: this.ipfsService,
      blockEpoch,
      blockAttestattionV1
    })

    this.messaging = new Messaging({
      contractService: this.contractService,
      ipfsCreator,
      OrbitDB,
      ecies,
      messagingNamespace
    })

    this.token = new Token({
      contractService: this.contractService,
      ipfsService: this.ipfsService,
      marketplace: this.marketplace
    })
  }
}
