const fetch = require('cross-fetch')
const SubProvider = require('./Subprovider')

const CACHE_TIME = 15000
const GAS_STATION_URL = 'https://ethgasstation.info/json/ethgasAPI.json'
const GAS_PRICE_KEY = process.env.GAS_PRICE_KEY || 'average' // 'safeLow'

/**
 * Wraps a fetch with a timeout
 *
 * @param url {string} URL to fetch
 * @param ms {number} timeout in milliseconds
 * @returns {object} fetch response object
 */
function timeoutFetch(url, ms = 10000) {
  return Promise.race([
    fetch(url).then(res => {
      return res
    }),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('timeout')), ms)
    })
  ])
}

class EthGasStationProvider extends SubProvider {
  constructor() {
    super()

    this.cache = {
      data: null,
      time: null
    }
  }

  async fetchData() {
    const res = await timeoutFetch(GAS_STATION_URL)
    if (res.status !== 200) {
      throw new Error(`Fetch returned code ${res.status}`)
    }
    const jason = await res.json()
    if (typeof jason[GAS_PRICE_KEY] !== 'undefined') {
      // values come from EGS as tenths of gwei
      return '0x' + (jason[GAS_PRICE_KEY] * 1e8).toString(16)
    }
    throw new Error(`Gas key of ${GAS_PRICE_KEY} is unavailable`)
  }

  handleRequest(payload, next, end) {
    const { method } = payload

    if (method === 'eth_gasPrice') {
      const now = new Date()

      if (this.cache.time && now - this.cache.time < CACHE_TIME) {
        return this.cache.data
      }

      return this.fetchData()
        .then(data => {
          this.cache = {
            data,
            time: now
          }

          return end(null, data)
        })
        .catch(err => {
          console.error('Error fetching results from ethgastation.info')
          console.error(err)
          // Send to next subprovider
          return next()
        })
    } else {
      return next()
    }
  }
}

module.exports = EthGasStationProvider
