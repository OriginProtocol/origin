const baseCurrencyCode = 'ETH'

const fetchRate = async (currencyCode) => {
  let exchangeURL = 'https://api.cryptonator.com/api/ticker/'
  exchangeURL += baseCurrencyCode.toLowerCase()
  exchangeURL += '-'
  exchangeURL += currencyCode.toLowerCase()

  return new Promise((resolve) => {
    fetch(exchangeURL)
      .then(res => res.json())
      .then(json => {
        const exchangeRateFromAPI = json.ticker.price
        if (typeof Storage !== 'undefined') {
          const object = { value: exchangeRateFromAPI, timestamp: new Date() }
          localStorage.setItem('origin.exchangeRate', JSON.stringify(object))
        }
        resolve(exchangeRateFromAPI)
      })
      .catch(console.error)
  })
}

export async function getConversionRate(currencyCode) {
  if (typeof Storage !== 'undefined') {
    const cachedRate = localStorage.getItem('origin.exchangeRate')
    if (cachedRate) {
      const HALF_HOUR = 30 * 60 * 1000
      const cachedTime = new Date(JSON.parse(cachedRate).timestamp)
      if (new Date() - cachedTime < HALF_HOUR) {
        return JSON.parse(cachedRate).value
      } else {
        localStorage.removeItem('origin.exchangeRate')
        return await fetchRate(currencyCode) // cache is invalid
      }
    } else {
      return await fetchRate(currencyCode) // isn't cached to begin with
    }
  } else {
    return await fetchRate(currencyCode) // localStorage not available
  }
}
