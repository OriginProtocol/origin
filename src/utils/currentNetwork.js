const networkNames = {
  1: 'Main Ethereum Network',
  2: 'Morden Test Network',
  3: 'Ropsten Test Network',
  4: 'Rinkeby Test Network',
  42: 'Kovan Test Network',
  999: 'Localhost'
}

/*
 * The optional environment variable will naturally be a string.
 * We parse it and fall back to Mainnet if falsy.
 */
const envNetworkId = parseInt(process.env.ETH_NETWORK_ID)
export const supportedNetworkId = envNetworkId || 1

export const supportedNetwork = networkNames[supportedNetworkId]
const getCurrentNetwork = (networkId) => networkNames[networkId]

export default getCurrentNetwork
