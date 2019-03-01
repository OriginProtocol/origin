const IpfsClient = require('ipfs-http-client')

export function promiseTimeout(ms, promise) {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(`Promised timed out in ${ms} ms`)
    }, ms)
  })

  return Promise.race([promise, timeout])
}

export const ipfsClient = IpfsClient({
  host: process.env.IPFS_API_HOST || 'localhost',
  port: process.env.IPFS_API_PORT || 5002,
  protocol: process.env.IPFS_API_PROTOCOL || 'http'
})

export async function addConfigToIpfs(config) {
  const configBuffer = Buffer.from(JSON.stringify(config))
  return promiseTimeout(5000, ipfsClient.add(configBuffer)).then(response => {
    return response[0].hash
  })
}

export async function getConfigFromIpfs(hash) {
  return promiseTimeout(5000, ipfsClient.cat(hash)).then(response => {
    return JSON.parse(response)
  })
}
