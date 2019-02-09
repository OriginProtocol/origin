const fetch = require('cross-fetch')

const appendSlash = url => {
  return url.substr(-1) === '/' ? url : url + '/'
}

class HotService {
  constructor({
    serverUrl
  } = {}) {
    this.serverUrl = serverUrl
  }

  async http(baseUrl, url, body, method) {
    const response = await fetch(appendSlash(baseUrl) + url, {
      method,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'content-type': 'application/json' }
    })
    const json = await response.json()
    if (response.ok) {
      return json
    }
    return Promise.reject(JSON.stringify(json))
  }

  async post(url, body) {
    try {
      return await this.http(this.serverUrl, url, body, 'POST')
    } catch (error) {
      console.log('Error posting to bridge server:', error)
      return
    }
  }

  async submitMarketplaceBehalf(cmd, params) {
    return this.post("submit-marketplace-onbehalf", {cmd, params})
  }

  async verifyOffer(offerId, params) {
    return this.post("verify-offer", {offerId, params})
  }
}

export default HotService
