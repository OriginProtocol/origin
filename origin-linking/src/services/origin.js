import Origin from 'origin'
import Web3 from 'web3'

const providerUrl = process.env.PROVIDER_URL
const discoveryServerUrl = process.env.DISCOVERY_SERVER_URL
const perfModeEnabled = (process.env.ENABLE_PERFORMANCE_MODE === 'true')
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl, 20000))
const origin = new Origin({
  ipfsDomain: process.env.IPFS_DOMAIN,
  ipfsApiPort: process.env.IPFS_API_PORT,
  ipfsGatewayPort: process.env.IPFS_GATEWAY_PORT,
  ipfsGatewayProtocol: process.env.IPFS_GATEWAY_PROTOCOL,
  web3,
  perfModeEnabled,
  discoveryServerUrl
})

export default origin
export { providerUrl, perfModeEnabled, discoveryServerUrl, web3 }
