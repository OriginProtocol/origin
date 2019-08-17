const fetch = require('cross-fetch')

// Per Protocol Labs request, we add this param to any request we send to their cluster.
const ORIGIN_PARAM = '?name=OriginProtocol'

class IpfsClusterApiService {
  constructor(ipfsClusterUrl, username, password) {
    this.ipfsClusterUrl = ipfsClusterUrl
    this.username = username || ''
    this.password = password || ''
  }

  async _sendRequest(method, path) {
    const resp = await fetch(
      this.ipfsClusterUrl + path + ORIGIN_PARAM,
      {
        method: method,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(this.username + ':' + this.password).toString('base64')
        }
      },
      function(err) {
        throw new Error(
          `Error occurred while trying to connect to ipfs cluster : ${err}`
        )
      }
    )

    if (resp.status === 404) {
      throw new Error(`ipfs cluster api endpoint doesn't exist`)
    }

    if (resp.status === 202) {
      // e.g successfully sending a request to pin a hash returns a 202
      return true
    }
    const data = await resp.json()
    if (data.code && data.code !== 200) {
      throw new Error(
        `ipfs cluster api responded with an error, status: ${
          data['code']
        }, message: ${data['message']}`
      )
    }
    return data
  }

  // Following sends a request to pin and returns true if the request has been successfully made.
  // A few more steps are carried out by the ipfs cluster service to actually successfully pin the hash.
  async pin(ipfsHash) {
    try {
      const pinned = await this._sendRequest('POST', '/pins/' + ipfsHash)
      return pinned
    } catch (err) {
      console.error(err)
    }
  }

  async unpin(ipfsHash) {
    try {
      const unpinned = await this._sendRequest('DELETE', '/pins/' + ipfsHash)
      return unpinned
    } catch (err) {
      console.error(err)
    }
  }

  async getPinStatus(ipfsHash) {
    try {
      const pinStatus = await this._sendRequest('GET', '/pins/' + ipfsHash)
      return pinStatus
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = IpfsClusterApiService
