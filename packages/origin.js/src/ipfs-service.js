/**
 * IPFS interface
 *
 * Compare with: https://github.com/RequestNetwork/requestNetwork/blob/master/packages/requestNetwork.js/src/servicesExternal/ipfs-service.ts
 */

const ipfsAPI = require('ipfs-api')
const MapCache = require('map-cache')
const promisify = require('util.promisify')

class IpfsService {
  constructor() {
    // If connecting to a local IPFS daemon, set envionment variables:
    // IPFS_DOMAIN = 127.0.0.1
    // IPFS_API_PORT = 5001
    // IPFS_GATEWAY_PORT = 8080
    // IPFS_GATEWAY_PROTOCOL = http
    this.ipfsDomain = process.env.IPFS_DOMAIN || 'gateway.originprotocol.com'
    this.ipfsApiPort = process.env.IPFS_API_PORT || '5002'
    this.ipfsGatewayPort = process.env.IPFS_GATEWAY_PORT || ''
    this.ipfsProtocol = process.env.IPFS_GATEWAY_PROTOCOL || 'https'

    this.ipfs = ipfsAPI(
      this.ipfsDomain,
      this.ipfsApiPort,
      {protocol: this.ipfsProtocol})
    this.ipfs.swarm.peers(function(error, response) {
      if (error) {
        console.error('IPFS - Can\'t connect to the IPFS API.')
        console.error(error)
      }
    })

    // Caching
    this.mapCache = new MapCache()
  }

  async submitFile(jsonData) {
      const file = {
        path: 'file.json',
        content: JSON.stringify(jsonData)
      }
      const addFile = promisify(this.ipfs.files.add.bind(this.ipfs.files))

      let response
      try {
        response = await addFile([file])
      } catch (error) {
        console.error('Can\'t connect to IPFS.', error)
        throw new Error('Can\'t connect to IPFS. Failure to submit file to IPFS')
      }

      const ipfsHashStr = response[0].hash
      if (!ipfsHashStr) {
        throw new Error('Failure to submit file to IPFS')
      }

      this.mapCache.set(ipfsHashStr, jsonData)
      return ipfsHashStr
  }

  async getFile(ipfsHashStr) {
    // Check for cache hit
    if (this.mapCache.has(ipfsHashStr)) {
      return this.mapCache.get(ipfsHashStr)
    }

    const catFile = promisify(this.ipfs.files.cat.bind(this.ipfs.files))

    // Get from IPFS network
    let stream
    try {
      stream = await catFile(ipfsHashStr)
    } catch (error) {
      console.error(error)
      throw new Error('Got ipfs cat err:' + error)
    }

    const response = await new Promise((resolve, reject) => {
      let res = ''
      stream.on('data', (chunk) => {
        res += chunk.toString()
      })
      stream.on('error', (err) => {
        reject('Got ipfs cat stream err:' + err)
      })
      stream.on('end', () => {
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(res)
        } catch (error) {
          reject(`Failed to parse response JSON: ${error}`)
          return;
        }
        this.mapCache.set(ipfsHashStr, parsedResponse)
        resolve(parsedResponse)
      })
    })
    return response
  }

  gatewayUrlForHash(ipfsHashStr) {
    const defaultPort = (this.ipfsProtocol === 'https' ? '443' : '80')
    let port = String(this.ipfsGatewayPort);
    if (port.length > 0 && port !== defaultPort) {
      port = `:${port}`
    }
    return (`${this.ipfsProtocol}://${this.ipfsDomain}${port}` +
      `/ipfs/${ipfsHashStr}`)
  }

}

export default IpfsService
