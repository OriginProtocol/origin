const DEFAULT_GATEWAY = 'gateway.0rigin.org'
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
        console.log("Can't connect to the IPFS Gateway.")
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
          console.log("Can't connect to the IPFS Gateway.")
          console.error(error)
          reject('Can\'t connect to the IPFS Gateway. Failure to submit listing to Ipfs')
          return
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
}

const ipfsService = new IpfsService()

export default ipfsService;
