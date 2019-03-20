import Origin from '@origin/js/src/index'
import Web3 from 'web3'

const API_SERVER = process.env.API_SERVER_PORT ? process.env.API_SERVER_DOMAIN + ":" + process.env.API_SERVER_PORT : process.env.API_SERVER_DOMAIN
const defaultProviderUrl = process.env.PROVIDER_URL

const apiUrl = process.env.API_SERVER_PROTOCOL + "://" + API_SERVER

// this is not quite right currently
const attestationServerUrl = `${apiUrl}/api/attestations`
const walletLinkerUrl = null
const localApi = process.env.API_SERVER_DOMAIN == 'localhost'
const defaultLocalRemoteHost = process.env.DEFAULT_API_SERVER_DOMAIN
const getEthCode = process.env.CB_BW_CODE

// create web3 with empty provider for now
const web3 = new Web3()

const config = {
  ipfsDomain: process.env.IPFS_DOMAIN,
  ipfsApiPort: process.env.IPFS_API_PORT,
  ipfsGatewayPort: process.env.IPFS_GATEWAY_PORT,
  ipfsGatewayProtocol: process.env.IPFS_GATEWAY_PROTOCOL,
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
