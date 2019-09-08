const fetch = require('cross-fetch')
const SubProvider = require('web3-provider-engine/subproviders/subprovider')

const CACHE_TIME = 15000
const GAS_STATION_URL = 'https://ethgasstation.info/json/ethgasAPI.json'
const GAS_PRICE_KEY = process.env.GAS_PRICE_KEY || 'average' // 'safeLow'

class EthGasStationProvider extends SubProvider {
  constructor() {
    super()

    this.cache = {
      data: null,
      time: null
    }
  }

  async fetchData() {
    const res = await fetch(GAS_STATION_URL)
    if (res.status !== 200) {
      throw new Error(`Fetch returned code ${res.status}`)
    }
    const jason = await res.json()
    if (typeof jason[GAS_PRICE_KEY] !== 'undefined') {
      // values come from EGS as tenths of gwei
      if (
        !jason[GAS_PRICE_KEY] ||
        typeof jason[GAS_PRICE_KEY] !== 'number' ||
        jason[GAS_PRICE_KEY] < 1
      ) {
        throw new Error('Gas price from ethgasstation does not appear valid')
      }
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
          next()
          return
        })
    } else {
      next()
      return
    }
  }
}

module.exports = EthGasStationProvider
