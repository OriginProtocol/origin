'use strict'

const request = require('superagent')

const { getAsync, redisClient } = require('../utils/redis')
const logger = require('../logger')

const currencies = [
  'ETH-USD',
  // DAI is disabled because coingecko doesn't support it
  // however DAI is pegged to USD so maybe we could just used 1
  // or call a different API to get it.
  // 'DAI-USD',
  'KRW-USD',
  'SGD-USD',
  'GBP-USD',
  'EUR-USD',
  'JPY-USD',
  'CNY-USD',
  'USD-USD'
]

function startExchangeRatePolling() {
  // TODO: Store the markets to be polled somewhere or in ENV and start poll with that.
  // pollExchangeRate('ETH-USD')
  pollExchangeRate(currencies)
}

/**
 * Recursively polls the exchange rate in fixed intervals
 */
async function pollExchangeRate(markets) {
  setTimeout(() => {
    fetchExchangeRate(markets).then(() => pollExchangeRate(markets))
  }, process.env.EXCHANGE_RATE_POLL_INTERVAL || 30000)
}

/**
 * Fetch exchange rate from remote URL
 * @ param markets - Array | String - Can be single or multiple markets
 */
async function fetchExchangeRate(markets) {
  try {
    // const exchangeURL = `https://api.cryptonator.com/api/ticker/${market}`
    const exchangeURL = `https://api.coingecko.com/api/v3/exchange_rates`
    const response = await request.get(exchangeURL)
    if (!response.ok) {
      throw new Error(response.error)
    }

    const rates = response.body.rates
    if (rates) {
      if (Array.isArray(markets)) {
        const result = markets.map(market => {
          return parseAndSetRateData(market, rates)
        })
        return result
      } else if (typeof markets === 'string') {
        return parseAndSetRateData(markets, rates)
      }
    }
  } catch (e) {
    logger.error(`Error getting ${markets} exchange rate:`, e)
  }
}

function parseAndSetRateData(market, rates) {
  const symbol = market.split('-')[0].toLowerCase()
  if (rates[symbol].value) {
    // rates are against btc value, here that value is converted to usd
    // and then used to get the exchange rate
    let rate = 1 / ((rates.btc.value / rates.usd.value) * rates[symbol].value)
    redisClient.set(`${market}_price`, rate)
    logger.debug(`Exchange rate for ${market} set to ${rate}`)
    return rate
  } else {
    throw new Error(`${market} not found`)
  }
}

/**
 * Get exchange rate from redis
 */
async function getExchangeRate(market) {
  let price
  try {
    price = await getAsync(`${market}_price`)
  } catch (error) {
    logger.error(`Cannot read ${market} exchange rate from redis`, error)
  }

  if (!price) {
    // Cache miss?
    logger.warn(`Exchange rate for ${market} missing in Redis`)

    price = await fetchExchangeRate(market)

    // Disabled Fallback values until we decide on a strategy
    // if (Number.isNaN(Number(price))) {
    //   // API is also down, send back the fallback values
    //   // FALLBACK_EXCHANGE_RATE_ETH_USD and FALLBACK_EXCHANGE_RATE_DAI_USD
    //   return (
    //     process.env[`FALLBACK_EXCHANGE_RATE_${market.replace('-', '_')}`] || 310
    //   )
    // }
  }

  return price
}

module.exports = {
  pollExchangeRate,
  fetchExchangeRate,
  getExchangeRate,
  startExchangeRatePolling
}
