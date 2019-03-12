/**
 * IPFS interface
 */

const MapCache = require('map-cache')
const fetch = require('cross-fetch')
const FormData = require('form-data')

const Ports = {
  http: '80',
  https: '443'
}

class IpfsService {
  constructor({
    ipfsGatewayProtocol,
    ipfsDomain,
    ipfsGatewayPort,
    ipfsApiPort
  } = {}) {
    this.gateway = `${ipfsGatewayProtocol}://${ipfsDomain}`
    this.api = `${ipfsGatewayProtocol}://${ipfsDomain}`

    if (ipfsGatewayPort && Ports[ipfsGatewayProtocol] !== ipfsGatewayPort) {
      this.gateway += `:${ipfsGatewayPort}`
    }
    if (ipfsApiPort && Ports[ipfsGatewayProtocol] !== ipfsApiPort) {
      this.api += `:${ipfsApiPort}`
    }

    this.mapCache = new MapCache()
  }

  /**
   * Convert an object to a JSON blob and submit it to IPFS.
   *
   * obj {string} - object to save as file
   */
  async saveObjAsFile(obj) {
    let file
    if (typeof Blob === 'undefined') {
      file = Buffer.from(JSON.stringify(obj))
    } else {
      file = new Blob([JSON.stringify(obj)])
    }

    const ipfsHash = await this.saveFile(file)
    // Cache the object
    this.mapCache.set(ipfsHash, obj)
    return ipfsHash
  }

  /**
   * Convert a data URI into a blob and submit it to IPFS.
   *
   * dataUri {string} - data uri to convert
   */
  async saveDataURIAsFile(dataURI) {
    // Extract the mime type
    const mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0]
    // Decode b64 encoded component
    const binary = new Buffer(dataURI.split(',')[1], 'base64').toString(
      'binary'
    )

    const buffer = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i)
    }

    let file
    if (typeof Blob === 'undefined') {
      file = Buffer.from([buffer])
    } else {
      file = new Blob([buffer], { type: mimeString })
    }

    return await this.saveFile(file)
  }

  async saveFile(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const rawRes = await fetch(`${this.api}/api/v0/add`, {
        method: 'POST',
        body: formData
      })
      const result = await rawRes.json()
      return result.Hash
    } catch (e) {
      throw new Error('Failure to submit file to IPFS', e)
    }
  }

  /**
   * Load a file from IPFS and parse the contents into an object.
   *
   * Used in conjuction with saveObjAsFile to save and retrieve objects into IPFS.
   *
   * ipfsHash {string} - hash of the ipfs file containing the object to load
   */
  async loadObjFromFile(ipfsHash) {
    if (this.mapCache.has(ipfsHash)) {
      return this.mapCache.get(ipfsHash)
    }
    const response = await this.loadFile(ipfsHash)
    const obj = response.json()
    this.mapCache.set(ipfsHash, obj)
    return obj
  }

  async loadFile(ipfsHash) {
    const timeout = new Promise((resolve, reject) => {
      const ms = 7000
      setTimeout(() => {
        reject(new Error('Timed out after ' + ms + ' ms'))
      }, ms)
    })
    try {
      return await Promise.race([timeout, fetch(this.gatewayUrlForHash(ipfsHash))])
    } catch (error) {
      throw new Error('Failure to get IPFS file ' + ipfsHash + ': ' + error.message)
    }
  }

  gatewayUrlForHash(ipfsHashStr) {
    return `${this.gateway}/ipfs/${ipfsHashStr}`
  }

  /**
   * Rewrites a URL to use the configured IPFS gateway.
   *
   * @param {array} url - the url to be rewritten
   */
  rewriteUrl(url) {
    if (url.startsWith('ipfs://')) {
      // Rewrite ipfs: URLs
      const ipfsHash = url.replace('ipfs://', '')
      return this.gatewayUrlForHash(ipfsHash)
    } else if (url.startsWith('dweb://ipfs/')) {
      // Rewrite dweb://ipfs URLs
      const ipfsHash = url.replace('dweb://ipfs/', '')
      return this.gatewayUrlForHash(ipfsHash)
    }
    // Leave data: URLs untouched
    return url
  }
}

export default IpfsService
