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

const getFiatExchangeRate = async (fiatCurrencyCode, cryptoCurrencyCode, exchangeRates) => {
  if (!fiatCurrencyCode) {
    fiatCurrencyCode = DEFAULT_FIAT
  }
  if (!cryptoCurrencyCode) {
    cryptoCurrencyCode = DEFAULT_CRYPTO
  }
  if (!exchangeRates) {
    exchangeRates = store.getState().exchangeRates
  }

  const currencyPair = `${fiatCurrencyCode.toUpperCase()}/${cryptoCurrencyCode.toUpperCase()}`
  const cachedExchangeRate = exchangeRates && exchangeRates[currencyPair]

  if (cachedExchangeRate) {
    if (new Date().getTime() - cachedExchangeRate.timestamp.getTime() < EXCHANGE_RATE_CACHE_TTL) {
      return {
        rate: parseFloat(cachedExchangeRate.rate),
        cacheHit: true
      }
    } else {
      return await fetchRate(fiatCurrencyCode, cryptoCurrencyCode)
    }
  } else {
    return await fetchRate(fiatCurrencyCode, cryptoCurrencyCode)
  }
}


export const getFiatPrice = async (
  priceEth,
  fiatCurrencyCode,
  cryptoCurrencyCode,
  exchangeRates,
  formatResult = true
) => {
  if (!priceEth) {
    priceEth = 0
  }
  const exchangeRate = await getFiatExchangeRate(
    fiatCurrencyCode,
    cryptoCurrencyCode,
    exchangeRates
  )
  if (formatResult)
    return Number(priceEth * exchangeRate.rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  else
    return priceEth * exchangeRate.rate
}

export const getEthPrice = async (
  priceFiat,
  fiatCurrencyCode,
  cryptoCurrencyCode
) => {
  if (!priceFiat) {
    priceFiat = 0
  }
  const exchangeRate = await getFiatExchangeRate(
    fiatCurrencyCode,
    cryptoCurrencyCode
  )
  return Number(priceFiat / exchangeRate.rate)
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
