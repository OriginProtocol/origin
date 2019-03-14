const fetch = require('node-fetch')

const logger = require('../logger')

// TODO: implement a smart cache to prevent risk of memory exhaustion.
const ipCache = {}

const apiKey = process.env.IPDATA_API_KEY
if (!apiKey) {
  logger.warn(`IPDATA_API_KEY env var not set. Geolocation will fail.`)
}

/**
 * Resolves an IP address into a country code and name.
 *
 * @param {string} ip
 * @returns {Promise<{countryName: string, countryCode:string} || null>}
 */
async function ip2geo(ip) {
  if (!apiKey) {
    logger.error(`IPDATA_API_KEY not set. Geolocation failed.`)
    return null
  }

  // If api response found in cache just return that.
  if (ipCache[ip]) {
    return ipCache[ip]
  }

  const ipdataResponse = await fetch(
    `https://api.ipdata.co/${ip}?api-key=${apiKey}`
  )

  if (ipdataResponse.status !== 200) {
    const responseBody = await ipdataResponse.json()
    logger.error(
      'Unexpected response received from Ipdata: ',
      JSON.stringify(responseBody)
    )
    return null
  }

  const responseBody = await ipdataResponse.json()
  const response = {
    countryName: responseBody.country_name,
    countryCode: responseBody.country_code
  }
  ipCache[ip] = response
  return response
}

module.exports = { ip2geo }
