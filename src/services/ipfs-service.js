// const DEFAULT_GATEWAY = 'gateway.0rigin.org'
const DEFAULT_GATEWAY = '127.0.0.1'
const ipfsAPI = require('ipfs-api')

class IpfsService {
  static instance

  constructor() {
    if (IpfsService.instance) {
      return IpfsService.instance
    }

    this.ipfs = ipfsAPI(DEFAULT_GATEWAY, '5001', {protocol: 'http'})
    this.ipfs.swarm.peers(function(error, response) {
      if (error) {
        console.error("Can't connect to the IPFS Gateway.")
        console.error(error)
      } else {
        console.log("IPFS - connected to " + response.length + " peers")
      }
    });

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
          console.error("Can't connect to the IPFS Gateway.")
          console.error(error)
          reject('Can\'t connect to the IPFS Gateway. Failure to submit listing to Ipfs')
        }
        const file = response[0]
        const ipfsListing = file.hash

        if (ipfsListing) {
          resolve(ipfsListing)
        } else {
          reject('Failure to submit listing to Ipfs')
        }
      })
    });
  }

  getListing(ipfsHashStr) {
    return new Promise((resolve, reject) => {

      this.ipfs.files.cat(ipfsHashStr, function (err, stream) {
        if (err) {
          console.error(err)
          reject("Got ipfs cat err:" + err)
        }

        var res = ''
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

    });
  }
}

const ipfsService = new IpfsService()

export default ipfsService;
