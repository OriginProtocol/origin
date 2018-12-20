const fetch = require('cross-fetch');

class IpfsClusterApiService {
  constructor(ifpsClusterUrl) {
    this.ifpsClusterUrl = ifpsClusterUrl
  }

  async _sendRequest(method, path, params=null) {
      const resp = await fetch(
        this.ifpsClusterUrl+path,
        {
          method: method,
        },
        function(error){
          throw new Error(`Error occured while trying to connect to ipfs cluster`)
        }
      )

      if (resp.status == 404){
        throw new Error(`ipfs cluster api endpoint doesn't exist`)
      }

      if (resp.status == 202){
        // e.g succesfully pinning a hash returns a 202
        return true
      }

      const data = await resp.json()
      if (data.code != 200){
        throw new Error(`ipfs cluster api responded with an error, status: ${data['code']}, message: ${data['message']}`)
      }
      return data;
  }

  async listPins(){
    try {
      const pins = await this._sendRequest('GET', '/pins')
      return pins
    } catch(err){
      console.error(err);
    }
  }

  async pin(ipfsHash){
    try {
      const pinned = await this._sendRequest('POST', '/pins/'+ipfsHash)
      return pinned
    } catch(err){
      console.error(err);
    }
  }
}

module.exports = IpfsClusterApiService
