'use strict'

const chai = require('chai')
const expect = chai.expect
const nock = require('nock')
const request = require('supertest')

const Attestation = require('../src/models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')


describe('airbnb attestations', () => {
  beforeEach(() => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY = '0xc1912'

    Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a verification code', async () => {
    const response = await request(app)
      .get('/airbnb/generate-code')
      .query({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 123456
      })
      .expect(200)

    expect(response.body.code).equal(
      'topple wedding catalog topple catalog above february'
    )
  })

  it('should generate attestation on valid verification code', async () => {
    const ethAddress = '0x112234455C3a32FD11230C42E7Bccd4A84e02010'

    nock('https://www.airbnb.com')
      .get('/users/show/123456')
      .once()
      .reply(200, '<html>topple wedding catalog topple catalog above february</html>')

    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 123456
      })

    expect(response.body.schemaId).to.equal(
      'https://schema.originprotocol.com/attestation_1.0.0.json'
    )
    expect(response.body.data.issuer.name).to.equal('Origin Protocol')
    expect(response.body.data.issuer.url).to.equal(
      'https://www.originprotocol.com'
    )
    expect(response.body.data.attestation.verificationMethod.pubAuditableUrl).to.deep.equal(
      {}
    )
    expect(response.body.data.attestation.site.siteName).to.equal('airbnb.com')
    expect(response.body.data.attestation.site.userId.raw).to.equal(123456)

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.AIRBNB)
    expect(results[0].value).to.equal('123456')

  })

  it('should error on invalid airbnb user id format', async () => {
    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 'ab123456'
      })
      .expect(400)

    expect(response.body.errors.airbnbUserId).to.equal('Must be an integer')
  })

  it('should error on incorrect verification code', async () => {
    nock('https://www.airbnb.com')
      .get('/users/show/123456')
      .once()
      .reply(200, 'Hello!')

    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 123456
      })

    expect(response.body.errors[0]).to.equal(
      'Origin verification code "topple wedding catalog topple catalog above february" was not found in Airbnb profile.'
    )
  })

  it('should error on non existing airbnb user', async () => {
    nock('https://www.airbnb.com')
      .get('/users/show/123456')
      .once()
      .reply(404)

    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 123456
      })

    expect(response.body.errors.airbnbUserId).to.equal('Airbnb user not found.')
  })

  it('should return a message on internal server error', async () => {
    nock('https://www.airbnb.com')
      .get('/users/show/654321')
      .once()
      .reply(500)

    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 654321
      })

    expect(response.body.errors[0]).to.equal('Could not fetch Airbnb profile.')
  })
})
