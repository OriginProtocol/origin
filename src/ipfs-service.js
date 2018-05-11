/**
 * IPFS interface
 */

const MapCache = require("map-cache")
const fetch = require("cross-fetch")
const FormData = require("form-data")

const Ports = {
  http: "80",
  https: "443"
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

  async submitFile(jsonData) {
    try {
      var formData = new FormData()
      formData.append("file", this.content(jsonData))

      var rawRes = await fetch(`${this.api}/api/v0/add`, {
        method: "POST",
        body: formData
      })
      var res = await rawRes.json()
      this.mapCache.set(res.Hash, jsonData)
      return res.Hash
    } catch (e) {
      throw e
      throw new Error("Failure to submit file to IPFS", e)
    }
  }

  content(data) {
    if (typeof Blob === "undefined") {
      return new Buffer(JSON.stringify(data))
    } else {
      return new Blob([JSON.stringify(data)])
    }
  }

  async getFile(ipfsHashStr) {
    if (this.mapCache.has(ipfsHashStr)) {
      return this.mapCache.get(ipfsHashStr)
    }

    const response = await fetch(this.gatewayUrlForHash(ipfsHashStr))
    var ipfsData = await response.json()
    this.mapCache.set(ipfsHashStr, ipfsData)

    return ipfsData
  }

  gatewayUrlForHash(ipfsHashStr) {
    return `${this.gateway}/ipfs/${ipfsHashStr}`
  }
}

export default IpfsService
