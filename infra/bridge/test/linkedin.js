'use strict'

const chai = require('chai')
const expect = chai.expect
const express = require('express')
const nock = require('nock')
const request = require('supertest')
const querystring = require('querystring')

const Attestation = require('@origin/identity/src/models').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')
const { getAbsoluteUrl } = require('../src/utils')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'

describe('linkedin attestations', () => {
  beforeEach(async () => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY = '0xc1912'
    process.env.LINKEDIN_CLIENT_ID = 'linkedin-client-id'
    process.env.LINKEDIN_CLIENT_SECRET = 'linkedin-client-secret'
    process.env.LINKEDIN_BASE_AUTH_URL = 'https://www.linkedin.com/oauth/v2'
    process.env.LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/me'
    process.env.HOST = 'originprotocol.com'

    await Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a correct auth url', async () => {
    const response = await request(app)
      .get('/api/attestations/linkedin/auth-url')
      .expect(200)

    const params = {
      client_id: process.env.LINKEDIN_CLIENT_ID,
      response_type: 'code',
      redirect_uri: getAbsoluteUrl('/redirects/linkedin/'),
      scope: 'r_liteprofile'
    }

    expect(response.body.url).to.equal(
      `https://www.linkedin.com/oauth/v2/authorization?${querystring.stringify(
        params
      )}`
    )
  })

  it('should generate attestation on valid verification code', async () => {
    nock('https://www.linkedin.com')
      .post('/oauth/v2/accessToken')
      .query({
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: getAbsoluteUrl('/redirects/linkedin/'),
        code: 'abcdefg',
        grant_type: 'authorization_code'
      })
      .reply(200, { access_token: '12345' })

    nock('https://api.linkedin.com')
      .matchHeader('Authorization', 'Bearer 12345')
      .get('/v2/me')
      .reply(200, { id: 'Origin Protocol' })

    const response = await request(app)
      .post('/api/attestations/linkedin/verify')
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
    expect(response.body.data.attestation.site.siteName).to.equal(
      'linkedin.com'
    )
    expect(response.body.data.attestation.site.userId.raw).to.equal(
      'Origin Protocol'
    )

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.LINKEDIN)
    expect(results[0].value).to.equal('Origin Protocol')
  })

  it('should generate attestation on valid session', async () => {
    nock('https://www.linkedin.com')
      .post('/oauth/v2/accessToken')
      .query({
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: getAbsoluteUrl('/redirects/linkedin/'),
        code: 'abcdefg',
        grant_type: 'authorization_code',
        state: '123'
      })
      .reply(200, { access_token: '12345' })

    nock('https://api.linkedin.com')
      .matchHeader('Authorization', 'Bearer 12345')
      .get('/v2/me')
      .reply(200, { id: 'Origin Protocol' })

    // Fake session
    const parentApp = express()
    parentApp.use((req, res, next) => {
      req.session = {}
      req.sessionStore = {
        get(sid) {
          expect(sid).to.equal('123')
          return {
            code: 'abcdefg'
          }
        }
      }
      next()
    })
    parentApp.use(app)

    const response = await request(parentApp)
      .post('/api/attestations/linkedin/verify')
      .send({
        identity: ethAddress,
        sid: '123'
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
    expect(response.body.data.attestation.site.siteName).to.equal(
      'linkedin.com'
    )
    expect(response.body.data.attestation.site.userId.raw).to.equal(
      'Origin Protocol'
    )

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.LINKEDIN)
    expect(results[0].value).to.equal('Origin Protocol')
  })

  it('should error on invalid session', async () => {
    // Fake session
    const parentApp = express()
    parentApp.use((req, res, next) => {
      req.session = {}
      req.sessionStore = {
        get(sid) {
          expect(sid).to.equal('123')
          return {
            code: 'abcdefg'
          }
        }
      }
      next()
    })
    parentApp.use(app)

    const response = await request(parentApp)
      .post('/api/attestations/linkedin/verify')
      .send({
        identity: ethAddress,
        sid: '12345'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Invalid session')
  })

  it('should error on missing verification code and session id', async () => {
    const response = await request(app)
      .post('/api/attestations/linkedin/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal(
      'Field `code` or `sid` must be specified.'
    )
  })
})
