const chai = require('chai')
const expect = chai.expect

const { getLocationEligibilityInfo } = require('../src/util/locationInfo')
const { ip2geo } = require('@origin/ip2geo')

describe('Geolocation', () => {
  it(`Should return locationInfo`, async () => {
    const ip = '98.210.101.170'
    const info = await getLocationEligibilityInfo(ip)

    expect(info.countryCode).to.equal('US')
    expect(info.countryName).to.equal('United States of America')
    expect(info.eligibility).to.equal('Restricted')
  })

  it(`Should geolocalize an IP`, async () => {
    const ip = '98.210.101.170'
    const geo = await ip2geo(ip)

    expect(geo.countryCode).to.equal('US')
    expect(geo.countryName).to.equal('United States of America')
  })
})
