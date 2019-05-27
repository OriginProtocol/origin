const chai = require('chai')
const expect = chai.expect

const { ip2geo } = require('@origin/ip2geo')

describe('Geolocation', () => {
  it(`Should geolocalize an IP`, async () => {
    const ip = '98.210.101.170'
    const geo = await ip2geo(ip)

    expect(geo.countryCode).to.equal('US')
    expect(geo.countryName).to.equal('United States of America')
  })

  it(`Should return null on invalid IP`, async () => {
    const ip = '12345'
    const geo = await ip2geo(ip)

    expect(geo).to.be.null
  })
})
