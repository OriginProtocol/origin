console.log("PRE import origin....")
import Origin from 'origin'
console.log("POST import origin....")
import Web3 from 'web3'
import {localfy} from '../tools'
import {PROVIDER_URL, BRIDGE_SERVER_PROTOCOL,  
  BRIDGE_SERVER_DOMAIN, BRIDGE_SERVER_PORT,
  IPFS_DOMAIN, IPFS_API_PORT, IPFS_GATEWAY_PORT, IPFS_GATEWAY_PROTOCOL, MESSAGE_OPEN_URL} from 'react-native-dotenv'


const BRIDGE_SERVER = localfy(BRIDGE_SERVER_PORT ? BRIDGE_SERVER_DOMAIN + ":" + BRIDGE_SERVER_PORT : BRIDGE_SERVER_DOMAIN)

const defaultProviderUrl = PROVIDER_URL

const bridgeUrl = BRIDGE_SERVER_PROTOCOL + "://" + BRIDGE_SERVER 

const attestationServerUrl = `${bridgeUrl}/api/attestations`
const walletLinkerUrl = null
const messageOpenUrl = localfy(MESSAGE_OPEN_URL)
// create web3 with empty provider for now
const web3 = new Web3() 

const config = {
  ipfsDomain: localfy(IPFS_DOMAIN),
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

console.log("PRE instantiate origin....")
const origin = new Origin(config)
console.log("POST instantiate origin....")
// Replace global web3 with Origin.js-constructed instance
global.web3 = origin.contractService.web3
export default origin
export {bridgeUrl, defaultProviderUrl, messageOpenUrl}

