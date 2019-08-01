'use strict'

const request = require('superagent')

const { getAsync, redisClient } = require('../utils/redis')
const logger = require('../logger')

function startExchangeRatePolling() {
  // TODO: Store the markets to be polled somewhere or in ENV and start poll with that.
  pollExchangeRate('ETH-USD')
  pollExchangeRate('DAI-USD')
  pollBulkFiatExchangeRates()
}

/**
 * Recursively polls the exchange rate in fixed intervals
 */
async function pollExchangeRate(market) {
  setTimeout(() => {
    fetchExchangeRate(market).then(() => pollExchangeRate(market))
  }, process.env.EXCHANGE_RATE_POLL_INTERVAL || 30000)
}

/**
 * Recursively polls bulk fiat exchange rates in fixed intervals
 */
async function pollBulkFiatExchangeRates() {
  setTimeout(() => {
    fetchBulkFiatExchangeRates().then(() => pollBulkFiatExchangeRates())
  }, process.env.EXCHANGE_RATE_POLL_INTERVAL || 30000)
}

/**
 * Fetch excahnge rate from remote URL
 */
async function fetchExchangeRate(market) {
  const exchangeURL = `https://api.cryptonator.com/api/ticker/${market}`

  return new Promise(async (resolve, reject) => {
    try {
      const response = await request.get(exchangeURL)
      if (!response.body.success) {
        reject(response.body.error)
        return
      }

      resolve(response.body.ticker.price)
    } catch (error) {
      reject(error)
    }
  })
    .then(price => {
      if (price) {
        // redisClient.set(`${market}_price`, price, 'NX')
        redisClient.set(`${market}_price`, price)
        logger.debug(`Exchange rate for ${market} set to ${price}`)
      }

      return price
    })
    .catch(e => logger.error(`Error getting ${market} exchange rate:`, e))
}

/**
 * Fetch bulk fiat excahnge rates from remote URL
 */
async function fetchBulkFiatExchangeRates() {
  const exchangeURL = `https://api.exchangeratesapi.io/latest?base=USD`

  return new Promise(async (resolve, reject) => {
    try {
      const response = await request.get(exchangeURL)
      if (!response.ok) {
        reject(response.error)
        return
      }

      resolve(response.body.rates)
    } catch (error) {
      reject(error)
    }
  })
    .then(rates => {
      if (rates) {
        Object.entries(rates).forEach(r => {
          const market = `${r[0]}-USD`
          const price = r[1].toString()
          redisClient.set(`${market}_price`, price)
          logger.debug(`Exchange rate for ${market} set to ${price}`)
        })
        // logger.info(`Exchange rates set: `, resolvedRates)
      }
    })
    .catch(e => logger.error(`Error getting bulk fiat exchange rates:`, e))
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
      // API is also down, send back the fallback values
      // FALLBACK_EXCHANGE_RATE_ETH_USD and FALLBACK_EXCHANGE_RATE_DAI_USD
      return (
        process.env[`FALLBACK_EXCHANGE_RATE_${market.replace('-', '_')}`] || 310
      )
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
