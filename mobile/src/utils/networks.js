import { MAINNET_API_SERVER, RINKEBY_API_SERVER } from 'react-native-dotenv'

const networks = [
  { id: 1, name: 'Mainnet', url: MAINNET_API_SERVER, custom: false },
  { id: 4, name: 'Rinkeby', url: RINKEBY_API_SERVER, custom: false },
  { id: 999, name: 'Custom', url: '', custom: true }
]

export function getCurrentNetwork(network_url) {
  let network

  for (network of networks) {
    if (network.url === network_url && !network.custom) {
      return network
    }
  }

  return network
}

export default networks
