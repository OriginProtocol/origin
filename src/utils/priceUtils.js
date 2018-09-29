import store from '../Store'
import { setExchangeRate } from 'actions/ExchangeRates'

const DEFAULT_FIAT = 'USD'
const DEFAULT_CRYPTO = 'ETH'
const EXCHANGE_RATE_CACHE_TTL = 2 * 60 * 1000 // 2 minutes
const EXCHANGE_RATE_POLL_INTERVAL = 2 * 60 * 1000 // 2 minutes

const fetchRate = async (fiatCurrencyCode, cryptoCurrencyCode) => {
  const cryptoParam = cryptoCurrencyCode.toLowerCase()
  const fiatParam = fiatCurrencyCode.toLowerCase()
  const exchangeURL = `https://api.cryptonator.com/api/ticker/${cryptoParam}-${fiatParam}`

  return new Promise(resolve => {
    fetch(exchangeURL)
      .then(res => res.json())
      .then(json => {
        resolve({
          rate: parseFloat(json.ticker.price),
          cacheHit: false
        })
      })
      .catch(console.error)
  })
}

const getFiatExchangeRate = async (fiatCurrencyCode, cryptoCurrencyCode) => {
  const { fiatCode, cryptoCode } = setDefaults(fiatCurrencyCode, cryptoCurrencyCode)
  const { rate, timestamp } = getCachedCurrencyPair(fiatCurrencyCode, cryptoCurrencyCode)

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

const setDefaults = (fiatCode, cryptoCode, exchangeRates) => {
  return {
    fiatCode: fiatCode || DEFAULT_FIAT,
    cryptoCode: cryptoCode || DEFAULT_CRYPTO,
    exchangeRates: exchangeRates || store.getState().exchangeRates
  }
}

const getCachedCurrencyPair = (fiatCurrencyCode, cryptoCurrencyCode) => {
  const { fiatCode, cryptoCode, exchangeRates } = setDefaults(fiatCurrencyCode, cryptoCurrencyCode)
  const currencyPair = `${fiatCode.toUpperCase()}/${cryptoCode.toUpperCase()}`

  return (exchangeRates && exchangeRates[currencyPair]) || {}
}

export const getFiatPrice = (
  priceEth,
  fiatCurrencyCode,
  cryptoCurrencyCode,
  formatResult = true
) => {
  if (!priceEth) {
    priceEth = 0
  }

  const { rate } = getCachedCurrencyPair(fiatCurrencyCode, cryptoCurrencyCode)

  if (formatResult)
    return Number(priceEth * (rate || 0)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  else
    return priceEth * (rate || 0)
}

export const getEthPrice = async (
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

const updateExchangeRate = async () => {
  const exchangeRate = await getFiatExchangeRate()
  if (!exchangeRate.cacheHit) {
    store.dispatch(setExchangeRate(DEFAULT_FIAT, DEFAULT_CRYPTO, exchangeRate.rate))
  }
}

updateExchangeRate()

setInterval(async () => {
  updateExchangeRate()
}, EXCHANGE_RATE_POLL_INTERVAL)
