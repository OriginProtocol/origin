const fetch = require('node-fetch')
const ipCache = {}
const restrictedCountryCodes = ['US', 'CA']
const forbiddenCountryCodes = []

const getLocationInfo = async ip => {
  const apiKey = process.env.IPDATA_API_KEY
  if (!apiKey) {
    console.warn(
      `IPDATA_API_KEY environmental variable not set. Can not fetch location information`
    )
    return false
  }
  // if api response found in cache just return that
  if (ipCache[ip]) {
    return ipCache[ip]
  }

  const ipdataResponse = await fetch(
    `https://api.ipdata.co/${ip}?api-key=${process.env.IPDATA_API_KEY}`
  )
  if (ipdataResponse.status === 200) {
    const responseBody = await ipdataResponse.json()
    const response = {
      countryName: responseBody.country_name,
      countryCode: responseBody.country_code,
      isRestricted: restrictedCountryCodes.includes(responseBody.country_code),
      isForbidden: forbiddenCountryCodes.includes(responseBody.country_code)
    }
    ipCache[ip] = response
    return response
  } else {
    const responseBody = await ipdataResponse.json()
    console.log(
      'Unexpected response received from Ipdata: ',
      JSON.stringify(responseBody)
    )
    return false
  }
}

module.exports = {
  getLocationInfo
}
