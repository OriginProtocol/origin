'use strict'

const request = require('superagent')

const { getAsync, redisClient } = require('../utils/redis')
const logger = require('../logger')

const REDIS_EXCHANGE_RATE_KEY = 'ETH_USD_price'

/**
 * Recursively polls the exchange rate in fixed intervals
 */
async function pollExchangeRate() {
  setTimeout(() => {
    fetchExchangeRate()
      .then(() => pollExchangeRate())
  }, process.env.EXCHANGE_RATE_POLL_INTERVAL || 30000)
}

/**
 * Fetch excahnge rate from remote URL
 */
async function fetchExchangeRate(cryptoCode, fiatCode) {
  const exchangeURL = `https://api.cryptonator.com/api/ticker/${cryptoCode}-${fiatCode}`

  return new Promise(async resolve => {
    const response = await request.post(exchangeURL)

    resolve(response.body.ticker.price)
  })
    .then(price => {
      redisClient.set(REDIS_EXCHANGE_RATE_KEY, price, 'NX')
    })
    .catch(e => logger.log('Error getting exchange rate', e))
}

/**
 * Get exchange rate from redis
 */
async function getExchangeRate() {
  let price
  try {
    price = await getAsync(REDIS_EXCHANGE_RATE_KEY)
  } catch (error) {
    logger.log(`Cannot read from redis`, error)
  }

  if (!price) {
    // Cache miss?
    logger.log(`Exchange rate missing in Redis`)

    return process.env.FALLBACK_EXCHANGE_RATE || 310
  }

  return price
}

module.exports = {
  pollExchangeRate,
  fetchExchangeRate,
  getExchangeRate
}
