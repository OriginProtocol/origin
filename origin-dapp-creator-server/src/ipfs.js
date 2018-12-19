const ipfsApi = require('ipfs-api')

export const ipfsClient = ipfsApi(
  process.env.IPFS_API_HOST || 'localhost',
  process.env.IPFS_API_PORT || 5002,
  {
    protocol: process.env.IPFS_API_PROTOCOL || 'http'
  }
)

export async function addConfigToIpfs(config) {
  const configBuffer = Buffer.from(JSON.stringify(config))
  const response = await ipfsClient.files.add(configBuffer)
  return response[0].hash
}

export async function getConfigFromIpfs(hash) {
  const response = await ipfsClient.files.cat(hash)
  return JSON.parse(response)
}
