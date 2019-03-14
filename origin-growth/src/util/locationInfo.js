const { ip2geo } = require('./ip2geo')

const restrictedCountryCodes = ['US', 'CA']
const forbiddenCountryCodes = []

/**
 * Returns country code, country name and
 * eligibility (Eligible, Forbiddem , Restricted, Unknown)
 * @param ip
 * @returns {{countryName: string, countryCode: string, eligibility: string}}
 */
async function getLocationInfo(ip) {
  if (!ip) {
    return null
  }

  const response = await ip2geo(ip)
  if (!response) {
    return {
      eligibility: 'Unknown',
      countryName: 'N/A',
      countryCode: 'N/A'
    }
  }

  const { countryName, countryCode } = response

  let eligibility = 'Eligible'
  if (forbiddenCountryCodes.includes(countryCode)) {
    eligibility = 'Forbidden'
  } else if (restrictedCountryCodes.includes(countryCode)) {
    eligibility = 'Restricted'
  }

  return {
    countryName,
    countryCode,
    eligibility
  }
}

module.exports = {
  getLocationInfo
}
