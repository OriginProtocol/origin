import Origin from 'origin'

let config = {
  ipfsDomain: process.env.IPFS_DOMAIN || undefined,
  ipfsApiPort: process.env.IPFS_API_PORT || undefined,
  ipfsGatewayPort: process.env.IPFS_GATEWAY_PORT || undefined,
  ipfsGatewayProtocol: process.env.IPFS_GATEWAY_PROTOCOL || undefined,
  attestationServerUrl:
    process.env.ATTESTATION_SERVER_URL ||
    'https://dev.bridge.originprotocol.com/api/attestations'
}

try {
  config.contractAddresses = JSON.parse(process.env.CONTRACT_ADDRESSES)
} catch (e) {
  /* Ignore */
}

const origin = new Origin(config)
window.web3 = origin.contractService.web3

export default origin
