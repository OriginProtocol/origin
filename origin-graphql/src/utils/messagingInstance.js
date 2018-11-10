import ecies from 'eth-ecies'
import OrbitDB from 'orbit-db'
import IPFS from 'ipfs'

import Messaging from './messaging'

const ipfsSwarm = '/dnsaddr/messaging.staging.originprotocol.com/tcp/443/wss/ipfs/QmR4xhzHSKJiHmhCTf3tWXLe3UV4RL5kqUJ2L81cV4RFbb' //process.env.IPFS_SWARM
const messagingNamespace = 'origin:staging' //process.env.MESSAGING_NAMESPACE

const ipfsCreator = repo_key => {
  const ipfsOptions = {
    repo: 'ipfs' + repo_key,
    preload: {
      enabled: false
    },
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
        // Swarm: [ipfsSwarm]
      }
    }
  }

  const ipfs = new IPFS(ipfsOptions)

  if (ipfsSwarm) {
    ipfs.on('start', async () => {
      await ipfs.swarm.connect(ipfsSwarm)
    })
    ipfs.__reconnect_peers = {}
    ipfs.__reconnect_peers[ipfsSwarm.split('/').pop()] = ipfsSwarm
  }

  return ipfs
}

const messaging = new Messaging({
  contractService: { web3: window.web3 },
  ipfsCreator,
  OrbitDB,
  ecies,
  messagingNamespace
})

window.msg = messaging

export default messaging
