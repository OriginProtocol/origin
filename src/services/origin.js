import Origin from 'origin'

let config = {}

config.ipfsDomain = process.env.IPFS_DOMAIN ? process.env.IPFS_DOMAIN : null
config.ipfsApiPort = process.env.IPFS_API_PORT
  ? process.env.IPFS_API_PORT
  : null
config.ipfsGatewayPort = process.env.IPFS_GATEWAY_PORT
  ? process.env.IPFS_GATEWAY_PORT
  : null
config.ipfsGatewayProtocol = process.env.IPFS_GATEWAY_PROTOCOL
  ? process.env.IPFS_GATEWAY_PROTOCOL
  : null
config.attestationServerUrl =
  'http://bridge-server-test.herokuapp.com/api/attestations'

const origin = new Origin(config)
window.web3 = origin.contractService.web3

export default origin
