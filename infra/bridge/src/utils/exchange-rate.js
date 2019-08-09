'use strict'

const request = require('superagent')

const { getAsync, redisClient } = require('../utils/redis')
const logger = require('../logger')

const currencies = [
  'ETH-USD',
  'DAI-USD',
  'KRW-USD',
  'SGD-USD',
  'GBP-USD',
  'EUR-USD',
  'JPY-USD',
  'CNY-USD'
]

function startExchangeRatePolling() {
  // TODO: Store the markets to be polled somewhere or in ENV and start poll with that.
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
 * Fetch exchange rate from coingecko
 * Alternatively https://api.cryptonator.com/api/ticker/${market}
 * can be used but the data payload is different and this function would need
 * updating
 * @param {string|Array<string>} markets - Can be single or multiple markets
 */
async function fetchExchangeRate(markets) {
  try {
    const exchangeURL = `https://api.coingecko.com/api/v3/exchange_rates`
    const response = await request.get(exchangeURL)
    if (!response.ok) {
      throw new Error(response.error)
    }

    const rates = response.body.rates
    if (rates) {
      if (Array.isArray(markets)) {
        return markets.map(market => parseAndSetRateData(market, rates))
      } else if (typeof markets === 'string') {
        return parseAndSetRateData(markets, rates)
      } else {
        throw new Error('Unexpected type for markets')
      }
    }
  } catch (e) {
    logger.error(`Error getting ${markets} exchange rate:`, e)
  }
}

function parseAndSetRateData(market, rates) {
  const symbol = market.split('-')[0].toLowerCase()
  let rate = ''
  if (symbol === 'dai') {
    // setting DAI to value of 1 because coingecko doesn't support it
    // and this is a stable coin pegged to USD value. Variation should
    // be so small its irrelevant.
    rate = '1'
  } else if (rates[symbol] && rates[symbol].value) {
    // rates returned by coingecko are against btc value, here that value is
    // converted to usd and then used to get the exchange rate
    rate = (
      1 /
      ((rates.btc.value / rates.usd.value) * rates[symbol].value)
    ).toString()
  } else {
    throw new Error(`${market} not found`)
  }
  redisClient.set(`${market}_price`, rate)
  logger.debug(`Exchange rate for ${market} set to ${rate}`)
  return rate
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

    if (Number.isNaN(Number(price))) {
      // API is also down, send back the fallback values from google 07/08/19
      const FALLBACK_EXCHANGE_RATES = {
        ETH_USD: '222.91',
        DAI_USD: '1',
        JPY_USD: '0.0094',
        KRW_USD: '0.00082',
        CNY_USD: '0.14',
        GBP_USD: '1.22',
        EUR_USD: '1.12',
        SGD_USD: '0.72'
      }
      return FALLBACK_EXCHANGE_RATES[`${market.replace('-', '_')}`]
    }
  }

  return price
}

module.exports = {
  pollExchangeRate,
  fetchExchangeRate,
  getExchangeRate,
  startExchangeRatePolling
}
