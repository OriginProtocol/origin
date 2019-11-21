'use strict'

import Configs from '@origin/graphql/src/configs'

import store from '../Store'
import fetch from 'cross-fetch'

import { setExchangeRate } from 'actions/ExchangeRates'

const DEFAULT_CRYPTO = 'ETH'
const DEFAULT_FIAT = 'USD'
const EXCHANGE_RATE_CACHE_TTL = 2 * 60 * 1000 // 2 minutes

/**
 * @function fetchRate
 * @description fetches exchange rate from data provider's API
 *
 * @param {string} fiatCurrencyCode - e.g. "USD"
 * @param {string} cryptoCurrencyCode - e.g. "ETH"
 * @return {object} exchange rate number and cache hit boolean to indicate if a valid cache was found
 */

export const fetchRate = async (fiatCurrencyCode, cryptoCurrencyCode) => {
  const cryptoParam = cryptoCurrencyCode.toUpperCase()
  const fiatParam = fiatCurrencyCode.toUpperCase()

  const settings = store.getState().settings
  const config = Configs[settings.network.name.toLowerCase()]

  const exchangeURL = `${config.bridge}/utils/exchange-rate?market=${cryptoParam}-${fiatParam}`
  return new Promise(resolve => {
    fetch(exchangeURL)
      .then(res => {
        if (!res.ok) {
          throw Error(res.statusText)
        }
        return res.text()
      })
      .then(text => {
        try {
          const json = JSON.parse(text)
          resolve({
            // Note: Bridge returns the value of ETH per USD
            // Mobile expects and uses the inverse value for gas
            // and value cost estimation
            rate: 1 / parseFloat(json.price),
            cacheHit: false
          })
        } catch (error) {
          console.log('Error parsing:', text, ' error ', error)
        }
      })
      .catch(e => console.log('Error getting currency', e))
  })
}

/**
 * @function getFiatExchangeRate
 * @description determines if cache is valid. If not, calls fetchRate()
 *
 * @param {string} fiatCurrencyCode - e.g. "USD"
 * @param {string} cryptoCurrencyCode - e.g. "ETH"
 * @return {object} exchange rate number and cache hit boolean to indicate if a valid cache was found
 */

export const getFiatExchangeRate = async (
  fiatCurrencyCode,
  cryptoCurrencyCode
) => {
  const { fiatCode, cryptoCode } = setDefaults(
    fiatCurrencyCode,
    cryptoCurrencyCode
  )
  const { rate, timestamp } = getCachedCurrencyPair(
    fiatCurrencyCode,
    cryptoCurrencyCode
  )
  if (rate) {
    if (new Date().getTime() - timestamp.getTime() < EXCHANGE_RATE_CACHE_TTL) {
      return {
        rate: parseFloat(rate),
        cacheHit: true
      }
    } else {
      return await fetchRate(fiatCode, cryptoCode)
    }
  } else {
    return await fetchRate(fiatCode, cryptoCode)
  }
}

/**
 * @function setDefaults
 * @description sets default values that can be overridden if needed
 *
 * @param {string} fiatCode - e.g. "USD"
 * @param {string} cryptoCode - e.g. "ETH"
 * @return {object} fiatCode, cryptoCode
 */

const setDefaults = (fiatCode, cryptoCode) => {
  return {
    fiatCode: fiatCode || DEFAULT_FIAT,
    cryptoCode: cryptoCode || DEFAULT_CRYPTO
  }
}

/**
 * @function getCachedCurrencyPair
 * @description gets a currency pair object from redux cache
 *
 * @param {string} fiatCurrencyCode - e.g. "USD"
 * @param {string} cryptoCurrencyCode - e.g. "ETH"
 * @return {object} exchange rate number and timestamp date object
 */

const getCachedCurrencyPair = (fiatCurrencyCode, cryptoCurrencyCode) => {
  const { fiatCode, cryptoCode, exchangeRates } = setDefaults(
    fiatCurrencyCode,
    cryptoCurrencyCode
  )
  const currencyPair = `${fiatCode.toUpperCase()}/${cryptoCode.toUpperCase()}`

  return (exchangeRates && exchangeRates[currencyPair]) || {}
}

/**
 * @function getFiatPrice
 * @description takes a cryptocurrency price and returns the corresponding fiat price
 *
 * @param {number} priceEth - the price in ETH that is being converted to fiat
 * @param {string} fiatCurrencyCode - defaults to "USD"
 * @param {string} cryptoCurrencyCode - defaults to "ETH"
 * @param {boolean} formatResult - defaults to true - returns the value as a string with 2 decimal places
 * @return {string|number} fiat price as formatted string (default) or raw number
 */

export const getFiatPrice = (
  priceEth,
  fiatCurrencyCode = DEFAULT_FIAT,
  cryptoCurrencyCode = DEFAULT_CRYPTO,
  formatResult = true
) => {
  if (!priceEth) {
    priceEth = 0
  }

  const { rate } = getCachedCurrencyPair(fiatCurrencyCode, cryptoCurrencyCode)

  if (formatResult) {
    return Number(priceEth * (rate || 0)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } else {
    return priceEth * (rate || 0)
  }
}

/**
 * @function getCryptoPrice
 * @description takes a fiat price and returns the corresponding cryptocurrency price
 *
 * @param {number} priceFiat - the price in fiat that is being converted to crypto
 * @param {string} fiatCurrencyCode - defaults to "USD"
 * @param {string} cryptoCurrencyCode - defaults to "ETH"
 * @return {number} crypto price
 */

export const getCryptoPrice = async (
  priceFiat,
  fiatCurrencyCode,
  cryptoCurrencyCode
) => {
  if (!priceFiat) {
    priceFiat = 0
  }

  const { rate } = getCachedCurrencyPair(fiatCurrencyCode, cryptoCurrencyCode)

  return Number(priceFiat / rate)
}

/**
 * @function updateExchangeRate
 * @description retrieves and updates the exchange rate for a fiat/crypto pair
 *
 * @param {string} fiatCurrencyCode - defaults to "USD"
 * @param {string} cryptoCurrencyCode - defaults to "ETH"
 **/
export const updateExchangeRate = async (
  fiatCurrencyCode = DEFAULT_FIAT,
  cryptoCurrencyCode = DEFAULT_CRYPTO
) => {
  const exchangeRate = await getFiatExchangeRate(
    fiatCurrencyCode,
    cryptoCurrencyCode
  )
  if (!exchangeRate.cacheHit) {
    // Not a cache hit, store the update in redux
    store.dispatch(
      setExchangeRate(fiatCurrencyCode, cryptoCurrencyCode, exchangeRate.rate)
    )
  }
}
