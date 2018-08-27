const cryptoCurrencyCode = 'ETH'

const fetchRate = async (fiatCurrencyCode) => {
  if (!fiatCurrencyCode) {
    fiatCurrencyCode = 'USD'
  }
  let exchangeURL = 'https://api.cryptonator.com/api/ticker/'
  exchangeURL += cryptoCurrencyCode.toLowerCase()
  exchangeURL += '-'
  exchangeURL += fiatCurrencyCode.toLowerCase()

  return new Promise((resolve) => {
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

async function getFiatExchangeRate(fiatCurrencyCode) {
  if (typeof Storage !== 'undefined') {
    const cachedRate = localStorage.getItem('origin.exchangeRate')
    if (cachedRate) {
      const HALF_HOUR = 30 * 60 * 1000
      const cachedTime = new Date(JSON.parse(cachedRate).timestamp)
      if (new Date() - cachedTime < HALF_HOUR) {
        return parseFloat(JSON.parse(cachedRate).value)
      } else {
        localStorage.removeItem('origin.exchangeRate')
        return await fetchRate(fiatCurrencyCode) // cache is invalid
      }
    } else {
      return await fetchRate(fiatCurrencyCode) // isn't cached to begin with
    }
  } else {
    return await fetchRate(fiatCurrencyCode) // localStorage not available
  }
}

export async function getFiatPrice(priceEth, fiatCurrencyCode) {
  if (!priceEth) {
    priceEth = 0
  }
  const exchangeRate = await getFiatExchangeRate(fiatCurrencyCode)
  return Number(priceEth * exchangeRate).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )
}
