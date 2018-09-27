const fetchRate = async (fiatCurrencyCode, cryptoCurrencyCode) => {
  if (!fiatCurrencyCode) {
    fiatCurrencyCode = 'USD'
  }
  if (!cryptoCurrencyCode) {
    cryptoCurrencyCode = 'ETH'
  }
  let exchangeURL = 'https://api.cryptonator.com/api/ticker/'
  exchangeURL += cryptoCurrencyCode.toLowerCase()
  exchangeURL += '-'
  exchangeURL += fiatCurrencyCode.toLowerCase()

  return new Promise(resolve => {
    fetch(exchangeURL)
      .then(res => res.json())
      .then(json => {
        const exchangeRateFromAPI = parseFloat(json.ticker.price)
        if (typeof Storage !== 'undefined') {
          const object = { value: exchangeRateFromAPI, timestamp: new Date() }
          localStorage.setItem('origin.exchangeRate', JSON.stringify(object))
        }
        resolve(exchangeRateFromAPI)
      })
      .catch(console.error)
  })
}

const getFiatExchangeRate = async (fiatCurrencyCode, cryptoCurrencyCode) => {
  if (typeof Storage !== 'undefined') {
    const cachedRate = localStorage.getItem('origin.exchangeRate')
    if (cachedRate) {
      const HALF_HOUR = 30 * 60 * 1000
      const cachedTime = new Date(JSON.parse(cachedRate).timestamp)
      if (new Date() - cachedTime < HALF_HOUR) {
        return parseFloat(JSON.parse(cachedRate).value)
      } else {
        localStorage.removeItem('origin.exchangeRate')
        return await fetchRate(fiatCurrencyCode, cryptoCurrencyCode) // cache is invalid
      }
    } else {
      return await fetchRate(fiatCurrencyCode, cryptoCurrencyCode) // isn't cached to begin with
    }
  } else {
    return await fetchRate(fiatCurrencyCode, cryptoCurrencyCode) // localStorage not available
  }
}

export const getFiatPrice = async (
  priceEth,
  fiatCurrencyCode,
  cryptoCurrencyCode,
  formatResult = true
) => {
  if (!priceEth) {
    priceEth = 0
  }
  const exchangeRate = await getFiatExchangeRate(
    fiatCurrencyCode,
    cryptoCurrencyCode
  )
  if (formatResult)
    return Number(priceEth * exchangeRate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  else return priceEth * exchangeRate
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
  return Number(priceFiat / exchangeRate)
}
