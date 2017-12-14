const ipfsAPI = require('ipfs-api')

class IpfsService {
  static instance

  constructor() {
    if (IpfsService.instance) {
      return IpfsService.instance
    }

    this.ipfsDomain = process.env.IPFS_DOMAIN || '127.0.0.1' // Local IPFS daemon
    this.ipfsApiPort = process.env.IPFS_API_PORT || '5001'

    console.log("this.ipfsDomain:" + this.ipfsDomain)
    this.ipfs = ipfsAPI(this.ipfsDomain, this.ipfsApiPort, {protocol: 'https'})
    this.ipfs.swarm.peers(function(error, response) {
      if (error) {
        console.error("Can't connect to the IPFS API.")
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
    });
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

    });
  }
}

const ipfsService = new IpfsService()

export default ipfsService;
