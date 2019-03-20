import Origin from '@origin/js'
import Web3 from 'web3'

import {
  PROVIDER_URL,
  API_SERVER_PROTOCOL,
  API_SERVER_DOMAIN,
  API_SERVER_PORT,
  IPFS_DOMAIN,
  IPFS_API_PORT,
  IPFS_GATEWAY_PORT,
  IPFS_GATEWAY_PROTOCOL,
  DEFAULT_API_SERVER_DOMAIN,
  CB_BW_CODE
} from 'react-native-dotenv'

const API_SERVER = API_SERVER_PORT ? API_SERVER_DOMAIN + ":" + API_SERVER_PORT : API_SERVER_DOMAIN
const defaultProviderUrl = PROVIDER_URL

const apiUrl = API_SERVER_PROTOCOL + "://" + API_SERVER

// this is not quite right currently
const attestationServerUrl = `${apiUrl}/api/attestations`
const walletLinkerUrl = null
const localApi = API_SERVER_DOMAIN == 'localhost'
const defaultLocalRemoteHost = DEFAULT_API_SERVER_DOMAIN
const getEthCode = CB_BW_CODE

// create web3 with empty provider for now
const web3 = new Web3()

const config = {
  ipfsDomain: IPFS_DOMAIN,
  ipfsApiPort: IPFS_API_PORT,
  ipfsGatewayPort: IPFS_GATEWAY_PORT,
  ipfsGatewayProtocol: IPFS_GATEWAY_PROTOCOL,
  attestationServerUrl,
  walletLinkerUrl,
  web3,
  disableNotifications:true
}

try {
  config.contractAddresses = JSON.parse(process.env.CONTRACT_ADDRESSES)
} catch (e) {
  /* Ignore */
}

const origin = new Origin(config)
// Replace global web3 with Origin.js-constructed instance
global.web3 = origin.contractService.web3
global.originTest = origin
export default origin
export {apiUrl, defaultProviderUrl, localApi, defaultLocalRemoteHost, getEthCode}
