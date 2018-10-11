import Origin from 'origin'
import IPFS from 'ipfs'
import Web3 from 'web3'
import ecies from 'eth-ecies'
import OrbitDB from 'orbit-db'

/*
 * It may be preferential to use websocket provider
 * WebsocketProvider("wss://rinkeby.infura.io/ws")
 * But Micah couldn't get it to connect ¯\_(ツ)_/¯
 */
const defaultProviderUrl = process.env.PROVIDER_URL
const defaultBridgeUrl = 'https://bridge.originprotocol.com'
const bridgeProtocol = process.env.BRIDGE_SERVER_PROTOCOL
const bridgeDomain = process.env.BRIDGE_SERVER_DOMAIN
const customBridgeUrl = `${bridgeProtocol}://${bridgeDomain}`
const hasCustomBridge = bridgeProtocol && bridgeDomain
const bridgeUrl = hasCustomBridge ? customBridgeUrl : defaultBridgeUrl
const attestationServerUrl = `${bridgeUrl}/api/attestations`
const ipfsSwarm = process.env.IPFS_SWARM
const web3 = new Web3(
  // Detect MetaMask using global window object
  window.web3
    ? // Use MetaMask provider
    window.web3.currentProvider
    : // Use wallet-enabled browser provider
    Web3.givenProvider ||
      // Create a provider with Infura node
      new Web3.providers.HttpProvider(defaultProviderUrl, 20000)
)

const ipfsCreator = repo_key => {
  const ipfsOptions = {
    repo: 'ipfs' + repo_key,
    EXPERIMENTAL: {
      pubsub: true,
      relay: {
        enabled: true, // enable relay dialer/listener (STOP)
        hop: {
          enabled: true // make this node a relay (HOP)
        }
      }
    },
    config: {
      Bootstrap: [], // it's ok to connect to more peers than this, but currently leaving it out due to noise.
      Addresses: {
        // Swarm: ['/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star']
      }
    }
  }

  const ipfs = new IPFS(ipfsOptions)

  if (process.env.IPFS_SWARM) {
    ipfs.on('start', async () => {
      await ipfs.swarm.connect(ipfsSwarm)
    })
    ipfs.__reconnect_peers = {}
    ipfs.__reconnect_peers[ipfsSwarm.split('/').pop()] = ipfsSwarm
  }

  return ipfs
}

const config = {
  ipfsDomain: process.env.IPFS_DOMAIN,
  ipfsApiPort: process.env.IPFS_API_PORT,
  ipfsGatewayPort: process.env.IPFS_GATEWAY_PORT,
  ipfsGatewayProtocol: process.env.IPFS_GATEWAY_PROTOCOL,
  discoveryServerUrl: process.env.DISCOVERY_SERVER_URL,
  messagingNamespace: process.env.MESSAGING_NAMESPACE,
  arbitrator: process.env.ARBITRATOR_ACCOUNT,
  affiliate: process.env.AFFILIATE_ACCOUNT,
  blockEpoch: process.env.BLOCK_EPOCH,
  attestationServerUrl,
  ipfsCreator,
  OrbitDB,
  ecies,
  web3
}

try {
  config.contractAddresses = JSON.parse(process.env.CONTRACT_ADDRESSES)
} catch (e) {
  /* Ignore */
}

const origin = new Origin(config)
// Replace global web3 with Origin.js-constructed instance
window.web3 = origin.contractService.web3
// global Origin for others to access
window.originTest = origin

export default origin
