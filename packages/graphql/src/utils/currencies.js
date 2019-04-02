import fetch from 'node-fetch'

const EXCHANGE_RATES_POLL_INTERVAL = 10 * 60 * 1000 // 10 min.

class Currencies {
  constructor() {
    // Note: we set default values for the priceInUSD field in case the
    // centralized server we query to dynamically fetch exchange rates is down.
    // We have an open issue https://github.com/OriginProtocol/origin/issues/1860
    // to show a warning banner to the user in case rates are stale.
    this.data = {
      'fiat-USD': {
        id: 'fiat-USD',
        name: 'US Dollar',
        code: 'USD',
        priceInUSD: 1,
        countryCodes: ['US']
      },
      'fiat-GBP': {
        id: 'fiat-GBP',
        name: 'British Pound',
        code: 'GBP',
        priceInUSD: 1.31,
        countryCodes: ['GB']
      },
      'fiat-EUR': {
        id: 'fiat-EUR',
        name: 'Euro',
        code: 'EUR',
        priceInUSD: 1.12,
        countryCodes: ['FR']
      },
      'fiat-KRW': {
        id: 'fiat-KRW',
        name: 'South Korean Won',
        code: 'KRW',
        priceInUSD: 0.0009,
        countryCodes: ['KR']
      },
      'fiat-JPY': {
        id: 'fiat-JPY',
        name: 'Japanese Yen',
        code: 'JPY',
        priceInUSD: 0.1441,
        countryCodes: ['JP']
      },
      'fiat-CNY': {
        id: 'fiat-CNY',
        name: 'Chinese Yuan',
        code: 'CNY',
        priceInUSD: 0.15,
        countryCodes: ['CN']
      },
      'token-ETH': {
        id: 'token-ETH',
        address: '0x0000000000000000000000000000000000000000',
        code: 'ETH',
        name: 'Ether',
        priceInUSD: 158.16,
        decimals: 18
      },
      'token-DAI': {
        id: 'token-DAI',
        // address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
        name: 'DAI Stablecoin',
        code: 'DAI',
        priceInUSD: 1,
        decimals: 18
      },
      'token-USDC': {
        id: 'token-USDC',
        // address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        name: 'USDC Stablecoin',
        code: 'USDC',
        priceInUSD: 1,
        decimals: 6
      },
      'token-GUSD': {
        id: 'token-GUSD',
        // address: '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
        name: 'Gemini Dollar',
        code: 'GUSD',
        priceInUSD: 1,
        decimals: 2
      }
    }

    // Make a list of supported currency codes.
    this.currencyCodes = []
    for (const key of Object.keys(this.data)) {
      this.currencyCodes.push(this.data[key].code)
    }

    // Start the background polling of exchange rates.
    this.polled = false
    if (process.env.NODE_ENV !== 'test') {
      setInterval(async () => {
        this._poll()
      }, EXCHANGE_RATES_POLL_INTERVAL)
    }
  }

  /**
   * Fetches and updates exchange rates.
   * @returns {Promise<boolean>} Returns true if rates updated successfully. False otherwise.
   */
  async _poll() {
    // Fetch rates from CryptoCompare.
    const url =
      'https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=' +
      this.currencyCodes.join(',')
    let rates
    try {
      const response = await fetch(url, { timeout: 2000 })
      rates = await response.json()
    } catch (e) {
      console.error('API call to fetch xrates from CryptoCompare failed.')
      return false
    }

    // Update rates in our data structure.
    for (const key of Object.keys(this.data)) {
      const currencyCode = this.data[key].code
      if (!rates[currencyCode]) {
        console.error(`CryptoCompare did not return xrate for ${currencyCode}.`)
        continue
      }
      // Note: We inverse the rate since we query CryptoCompare for rates
      // from USD to other currencies, but we store price of a given currency in USD.
      // CryptoCompare has another api (called pricemulti) that we could use so that
      // we don't have to reverse but it does not work for all currencies (ex. KRW).
      this.data[key].priceInUSD = 1.0 / rates[currencyCode]
    }
    this.polled = true
    return true
  }

  /**
   * Returns data about a currency based on its id.
   * @param currencyId
   * @returns {{name:string, code:string, priceInUSD:string, countryCode:string}}
   */
  async get(currencyId) {
    if (!this.data[currencyId]) {
      throw new Error('Unsupported currency id', currencyId)
    }
    // Poll exchange rates if they haven't been populated yet.
    if (!this.polled) {
      if ((await this._poll()) !== true) {
        console.error(
          'Failed fetching currency exchange rates. Falling back to stale rates.'
        )
      }
    }
    return this.data[currencyId]
  }

  ids() {
    return Object.keys(this.data)
  }
}

// Create a singleton currency object.
const currencies = new Currencies()

export default currencies
