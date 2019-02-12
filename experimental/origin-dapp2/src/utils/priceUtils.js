const DEFAULT_CRYPTO = 'ETH'
const DEFAULT_FIAT = 'USD'

const setDefaults = (fiatCode, cryptoCode, exchangeRates) => {
  return {
    fiatCode: fiatCode || DEFAULT_FIAT,
    cryptoCode: cryptoCode || DEFAULT_CRYPTO,
    exchangeRates: exchangeRates
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
