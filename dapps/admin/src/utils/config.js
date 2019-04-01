import config from '@origin/graphql/src/contracts'

export function getIpfsGateway() {
  return config.ipfsGateway
}

export function getIpfsApi() {
  return config.ipfsRPC
}

export function getDiscovery() {
  return config.discovery
}
