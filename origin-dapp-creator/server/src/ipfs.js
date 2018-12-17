const ReadableStream = require('stream').Readable
const ipfsApi = require('ipfs-api')

export const ipfsClient = ipfsApi(
  process.env.IPFS_API_HOST || 'localhost',
  process.env.IPFS_API_PORT || 5002,
  {
    protocol: process.env.IPFS_API_PROTOCOL || 'http'
  }
)

export async function addConfigToIpfs(config) {
  const stream = new ReadableStream()
  stream.push(JSON.stringify(config))
  stream.push(null)

  const response = await ipfsClient.add(stream)
  return response[0].hash
}

export function getConfigFromIpfs(path) {
  return ipfsClient.get(path)
}
