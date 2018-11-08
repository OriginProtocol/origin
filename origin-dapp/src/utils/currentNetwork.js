const networks = [
  { id: 1, name: 'Main Ethereum Network', type: 'Mainnet Beta' },
  { id: 2, name: 'Morden Test Network', type: 'Testnet Beta' },
  { id: 3, name: 'Ropsten Test Network', type: 'Testnet Beta' },
  { id: 4, name: 'Rinkeby Test Network', type: 'Testnet Beta' },
  { id: 42, name: 'Kovan Test Network', type: 'Testnet Beta' },
  { id: 999, name: 'Localhost', type: 'Beta on Localhost' },
  { id: 2222, name: 'Origin Test Network', type: 'Origin Testnet Beta' }
]

/*
 * The optional environment variable will naturally be a string.
 * We parse it and fall back to Mainnet if falsy.
 */
const envNetworkId = parseInt(process.env.ETH_NETWORK_ID)
export const supportedNetworkId = envNetworkId || 1
export const supportedNetwork = networks.find((network) => network.id === supportedNetworkId)

const getCurrentNetwork = (networkId) => networks.find((network) => network.id === networkId)
export default getCurrentNetwork
