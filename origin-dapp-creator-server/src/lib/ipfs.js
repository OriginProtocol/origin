const ipfsApi = require('ipfs-api')

export function promiseTimeout(ms, promise) {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(`IPFS config retrieval timed out in ${ms} ms`)
    }, ms)
  })

  return Promise.race([promise, timeout])
}

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
  return promiseTimeout(5000, ipfsClient.files.cat(hash))
    .then((response) => {
      return JSON.parse(response)
    })
}
