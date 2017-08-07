var ipfsAPI = require('ipfs-api')

class IpfsService {

  static instance;

  constructor() {
    if (IpfsService.instance) {
      return IpfsService.instance;
    }

    this.ipfs = ipfsAPI('gateway.0rigin.org', '5001', {protocol: 'http'})
    this.ipfs.swarm.peers(function(err, response) { 
      if (err) {
        console.log("Can't connect to the IPFS Gateway.")
        console.error(err);
      } else {
        console.log("IPFS - connected to " + response.length + " peers");
      }
    });

    IpfsService.instance = this;
  }

  submitListing(formListing) {
    // Stub promise
    const promise = new Promise((resolve, reject) => {

      const file = {
        path: 'listing.json',
        content: JSON.stringify(formListing.formData)
      }

      this.ipfs.files.add([file], (err, res) => {
        const file = res[0]
        let ipfsListing = file.hash

        if (ipfsListing) {
          resolve(ipfsListing);
        } else {
          reject('Some failure thing');
        }
      })
    });

    return promise;
  }
}

let ipfsService = new IpfsService();

export default ipfsService;