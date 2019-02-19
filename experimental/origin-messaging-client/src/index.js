import ecies from 'eth-ecies'
import OrbitDB from 'orbit-db'
import IPFS from 'ipfs'

import OriginMessaging from './Messaging'

export default function Messaging({
  ipfsSwarm,
  messagingNamespace,
  web3,
  globalKeyServer,
  personalSign
}) {
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
      ipfs.on('start', async () => await ipfs.swarm.connect(ipfsSwarm))
      ipfs.__reconnect_peers = {}
      ipfs.__reconnect_peers[ipfsSwarm.split('/').pop()] = ipfsSwarm
    }

    return ipfs
  }

  return new OriginMessaging({
    contractService: { web3 },
    ipfsCreator,
    OrbitDB,
    ecies,
    messagingNamespace,
    globalKeyServer,
    personalSign
  })
}
