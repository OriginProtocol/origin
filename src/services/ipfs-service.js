const ipfsAPI = require('ipfs-api')

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
  }

  submitListing(formListing) {
    return new Promise((resolve, reject) => {
      const file = {
        path: 'listing.json',
        content: JSON.stringify(formListing)
      }

      this.ipfs.files.add([file], (error, response) => {
        if (error) {
          console.error("Can't connect to IPFS.")
          console.error(error)
          reject('Can\'t connect to IPFS. Failure to submit listing to IPFS')
        }
        const file = response[0]
        const ipfsListing = file.hash

        if (ipfsListing) {
          resolve(ipfsListing)
        } else {
          reject('Failure to submit listing to IPFS')
        }
      })
    })
  }

  getListing(ipfsHashStr) {
    return new Promise((resolve, reject) => {

      this.ipfs.files.cat(ipfsHashStr, function (err, stream) {
        if (err) {
          console.error(err)
          reject("Got ipfs cat err:" + err)
        }

        let res = ''
        stream.on('data', function (chunk) {
          res += chunk.toString()
        })
        stream.on('error', function (err) {
          reject("Got ipfs cat stream err:" + err)
        })
        stream.on('end', function () {
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
