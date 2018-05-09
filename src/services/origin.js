import Origin from 'origin'

let config = {}

config.ipfsDomain = process.env.IPFS_DOMAIN || null
config.ipfsApiPort = process.env.IPFS_API_PORT || null
config.ipfsGatewayPort = process.env.IPFS_GATEWAY_PORT || null
config.ipfsGatewayProtocol = process.env.IPFS_GATEWAY_PROTOCOL || null
config.attestationServerUrl = process.env.ATTESTATION_SERVER_URL
  || 'http://bridge-server-test.herokuapp.com/api/attestations'

const origin = new Origin(config)
window.web3 = origin.contractService.web3

export default origin
