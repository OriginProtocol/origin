import Origin from 'origin'

const bridgeServerProtocol = process.env.BRIDGE_SERVER_PROTOCOL
const bridgeServerDomain = process.env.BRIDGE_SERVER_DOMAIN
const attestationServerUrl =
`${bridgeServerProtocol}://${bridgeServerDomain}/api/attestations`

const config = {
  ipfsDomain: process.env.IPFS_DOMAIN,
  ipfsApiPort: process.env.IPFS_API_PORT,
  ipfsGatewayPort: process.env.IPFS_GATEWAY_PORT,
  ipfsGatewayProtocol: process.env.IPFS_GATEWAY_PROTOCOL,
  attestationServerUrl
}

try {
  config.contractAddresses = JSON.parse(process.env.CONTRACT_ADDRESSES)
} catch (e) {
  /* Ignore */
}

const origin = new Origin(config)
window.web3 = origin.contractService.web3

export default origin
