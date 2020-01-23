'use strict'

const request = require('superagent')

const { redisClient } = require('../utils/redis')
const logger = require('../logger')

const baseCurrency = 'USD'

// TODO: Store the markets to be polled somewhere or
// in ENV and start poll with that.
// Markets to fetch the exchange rate of.
const currencies = [
  'ETH',
  'DAI',
  'KRW',
  'SGD',
  'GBP',
  'EUR',
  'JPY',
  'CNY',
  'USDC',
  'GUSD',
  'OKB',
  'USDT',
  'OGN'
]

let pollInterval

// To be used when API is down and there is nothing in cache
// Kind of very rare edge case
const FALLBACK_EXCHANGE_RATES = {
  ETH: 0.007072,
  DAI: 0.9992,
  KRW: 1141.5,
  SGD: 1.344,
  GBP: 0.7653,
  EUR: 0.9017,
  JPY: 109,
  CNY: 7.54,
  USDC: 0.9996,
  GUSD: 0.9863,
  OKB: 0.3467,
  OGN: 0.21,
  USDT: 1,
  USD: 1
}

// To cache the rates in memory
const CACHED_EXCHANGE_RATES = {}

/**
 * Recursively polls the exchange rate in fixed intervals
 */
async function pollExchangeRate() {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  // Initial fetch
  await fetchExchangeRates()

  // Start the poll
  pollInterval = setInterval(async () => {
    // Poll every 5mins
    await fetchExchangeRates()
  }, process.env.EXCHANGE_RATE_POLL_INTERVAL || 5 * 60 * 1000)
}

/**
 * Fetches and populates the exchange rates of all tokens
 *
 * @returns {{[token: String] => [rate: Number]}} An object of token => rate values
 */
async function fetchExchangeRates() {
  try {
    const exchangeURL = `https://min-api.cryptocompare.com/data/price?fsym=${baseCurrency}&tsyms=${currencies.join(
      ','
    )}`

    const response = await request.get(exchangeURL)
    if (!response.ok) {
      throw new Error(response.error)
    }

    const batch = redisClient.batch()

    for (const token in response.body) {
      logger.debug(
        `Exchange rate of ${token}/${baseCurrency} set to ${response.body[token]}`
      )
      // Store a copy of value in memory
      CACHED_EXCHANGE_RATES[token] = response.body[token]

      batch.set(`${token}-${baseCurrency}_price`, response.body[token])
    }

    // This is constant forever
    CACHED_EXCHANGE_RATES[baseCurrency] = 1

    // Storing to redis since `@origin/discovery` uses it.
    batch.exec(err => {
      if (err) {
        logger.error('Failed to cache exchange rates', err)
      }
    })
  } catch (e) {
    logger.error(`Error getting ${currencies.join(',')} exchange rate:`, e)
  }
}

/**
 * Get exchange rate from redis. In case of a cache-miss,
 * fetch from API or fallback to hardcoded constants.
 *
 * @param {String} market Target market
 * @returns {Number|{[token: String] => [rate: Number]}} The exchange rate for `market`, or the exchanges rate of all markets
 */
async function getExchangeRates(market) {
  if (!Object.keys(CACHED_EXCHANGE_RATES).length) {
    // We don't have anything in cache yet.
    // Fetch before proceeding
    await fetchExchangeRates()
  }

  if (!market) {
    return CACHED_EXCHANGE_RATES
  }

  const [token, fiat] = market.split('-')
  const tokenExchangeRate =
    CACHED_EXCHANGE_RATES[token] || FALLBACK_EXCHANGE_RATES[token]
  const fiatExchangeRate =
    (fiat && CACHED_EXCHANGE_RATES[fiat]) || FALLBACK_EXCHANGE_RATES[fiat]

  // if no fiat given assume USD
  if (!fiat) {
    return tokenExchangeRate
  } else {
    return tokenExchangeRate / fiatExchangeRate
  }
}

module.exports = {
  pollExchangeRate,
  fetchExchangeRates,
  getExchangeRates
}
