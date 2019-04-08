'use strict'

const chai = require('chai')
const expect = chai.expect
const nock = require('nock')
const request = require('supertest')
const querystring = require('querystring')

const Attestation = require('../src/models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')
const { getAbsoluteUrl } = require('../src/utils')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'

describe('google attestations', () => {
  beforeEach(() => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY = '0xc1912'
    process.env.GOOGLE_CLIENT_ID = 'facebook-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'facebook-client-secret'
    process.env.GOOGLE_BASE_AUTH_URL =
      'https://accounts.google.com/o/oauth2/v2/auth?'
    process.env.GOOGLE_BASE_API_URL = 'https://www.googleapis.com'
    process.env.HOST = 'originprotocol.com'

    Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a correct auth url', async () => {
    const response = await request(app)
      .get('/api/attestations/google/auth-url')
      .expect(200)

    const params = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      scope: 'email',
      response_type: 'code',
      redirect_uri: getAbsoluteUrl('/redirects/google/')
    }

    expect(response.body.url).to.equal(
      `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify(
        params
      )}`
    )
  })

  it('should generate attestation on valid verification code', async () => {
    nock(process.env.GOOGLE_BASE_API_URL)
      .post('/oauth2/v4/token')
      .query({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: getAbsoluteUrl('/redirects/google/'),
        code: 'abcdefg',
        grant_type: 'authorization_code'
      })
      .reply(200, { access_token: '12345' })

    nock(process.env.GOOGLE_BASE_API_URL)
      .get('/oauth2/v2/userinfo')
      .query({
        access_token: 12345
      })
      .reply(200, { name: 'Origin Protocol' })

    const response = await request(app)
      .post('/api/attestations/google/verify')
      .send({
        identity: ethAddress,
        code: 'abcdefg'
      })
      .expect(200)

    expect(response.body.schemaId).to.equal(
      'https://schema.originprotocol.com/attestation_1.0.0.json'
    )
    expect(response.body.data.issuer.name).to.equal('Origin Protocol')
    expect(response.body.data.issuer.url).to.equal(
      'https://www.originprotocol.com'
    )
    expect(response.body.data.attestation.verificationMethod.oAuth).to.equal(
      true
    )
    expect(response.body.data.attestation.site.siteName).to.equal('google.com')
    expect(response.body.data.attestation.site.userId.verified).to.equal(true)

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.GOOGLE)
    expect(results[0].value).to.equal('Origin Protocol')
  })

  it('should error on missing verification code', async () => {
    const response = await request(app)
      .post('/api/attestations/google/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Field code must not be empty.')
  })
})
