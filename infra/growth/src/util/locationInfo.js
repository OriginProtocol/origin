const { ip2geo } = require('@origin/ip2geo')

const restrictedCountryCodes = ['US']
const forbiddenCountryCodes = ['CU', 'IR', 'KP', 'SY']

/**
 * Returns country code and country name
 * @param ip
 * @returns {{countryName: string, countryCode: string}}
 */
async function getLocationInfo(ip) {
  if (!ip) {
    return null
  }

  const response = await ip2geo(ip)
  if (!response) {
    return {
      countryName: 'N/A',
      countryCode: 'N/A'
    }
  }

  const { countryName, countryCode } = response

  return {
    countryName,
    countryCode
  }
}

/**
 * Returns country code, country name and
 * eligibility (Eligible, Forbiddem , Restricted, Unknown)
 * @param ip
 * @returns {{countryName: string, countryCode: string, eligibility: string}}
 */
async function getLocationEligibilityInfo(ip) {
  const locationInfo = await getLocationInfo(ip)

  if (!locationInfo) {
    return null
  }

  let eligibility = 'Eligible'

  if (locationInfo.countryCode === 'N/A') {
    eligibility = 'Unknown'
  } else if (forbiddenCountryCodes.includes(locationInfo.countryCode)) {
    eligibility = 'Forbidden'
  } else if (restrictedCountryCodes.includes(locationInfo.countryCode)) {
    eligibility = 'Restricted'
  }

  return {
    ...locationInfo,
    eligibility
  }
}

module.exports = {
  getLocationInfo,
  getLocationEligibilityInfo
}
