const ipfsAPI = require('ipfs-api')
const MapCache = require('map-cache');

class IpfsService {
  static instance

  constructor() {
    if (IpfsService.instance) {
      return IpfsService.instance
    }

    // If connecting to a local IPFS daemon, set envionment variables
    // IPFS_DOMAIN = 127.0.0.1 and IPFS_API_PORT = 5001
    this.ipfsDomain = process.env.IPFS_DOMAIN || 'gateway.originprotocol.com'
    this.ipfsApiPort = process.env.IPFS_API_PORT || '5002'
    this.ipfsGatewayPort = process.env.IPFS_GATEWAY_PORT || ''
    this.ipfsProtocol = 'https'

    this.ipfs = ipfsAPI(this.ipfsDomain, this.ipfsApiPort, {protocol: this.ipfsProtocol})
    this.ipfs.swarm.peers(function(error, response) {
      if (error) {
        console.error("IPFS - Can't connect to the IPFS API.")
        console.error(error)
      }
    })
    IpfsService.instance = this

    // Caching
    this.mapCache = new MapCache()
  }

  submitListing(formListingJson) {
    return new Promise((resolve, reject) => {
      const file = {
        path: 'listing.json',
        content: JSON.stringify(formListingJson)
      }
      this.ipfs.files.add([file], (error, response) => {
        if (error) {
          console.error("Can't connect to IPFS.")
          console.error(error)
          reject('Can\'t connect to IPFS. Failure to submit listing to IPFS')
        }
        const file = response[0]
        const ipfsHashStr = file.hash
        if (ipfsHashStr) {
          this.mapCache.set(ipfsHashStr, formListingJson)
          resolve(ipfsHashStr)
        } else {
          reject('Failure to submit listing to IPFS')
        }
      })
    })
  }

  getListing(ipfsHashStr) {
    return new Promise((resolve, reject) => {
      // Check for cache hit
      if (this.mapCache.has(ipfsHashStr)) {
        resolve(this.mapCache.get(ipfsHashStr))
      }
      // Get from IPFS network
      this.ipfs.files.cat(ipfsHashStr, (err, stream) => {
        if (err) {
          console.error(err)
          reject("Got ipfs cat err:" + err)
        }
        let res = ''
        stream.on('data', (chunk) => {
          res += chunk.toString()
        })
        stream.on('error', function (err) {
          reject("Got ipfs cat stream err:" + err)
        })
        stream.on('end', () => {
          this.mapCache.set(ipfsHashStr, res)
          resolve(res)
        })
      })
    })
  }

  gatewayUrlForHash(ipfsHashStr) {
    return (`${this.ipfsProtocol}://${this.ipfsDomain}:` +
      `${this.ipfsGatewayPort}/ipfs/${ipfsHashStr}`)
  }

}

const ipfsService = new IpfsService()

export default ipfsService
