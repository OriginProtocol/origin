'use strict'

const chai = require('chai')
const expect = chai.expect
const express = require('express')
const nock = require('nock')
const request = require('supertest')

const Attestation = require('../src/models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'

const MOCK_PROFILE_DATA = { id_str: '12345', screen_name: 'OriginProtocol' }

describe('twitter attestations', async () => {
  beforeEach(() => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY = '0xc1912'
    process.env.HOST = 'originprotocol.com'
    process.env.TWITTER_CONSUMER_KEY = 'twitter-consumer-key'
    process.env.TWITTER_SECRET_KEY = 'twitter-secret-key'

    Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a correct auth url', async () => {
    nock('https://api.twitter.com')
      .post('/oauth/request_token')
      .reply(200, 'oauth_token=origin&oauth_token_secret=protocol')

    const response = await request(app)
      .get('/api/attestations/twitter/auth-url')
      .expect(200)

    expect(response.body.url).to.equal(
      'https://api.twitter.com/oauth/authenticate?oauth_token=origin'
    )
  })

  it('should generate attestation on valid verification code', async () => {
    nock('https://api.twitter.com')
      .post('/oauth/access_token')
      .reply(200)

    nock('https://api.twitter.com')
      .get('/1.1/account/verify_credentials.json')
      .reply(200, MOCK_PROFILE_DATA)

    // Fake a session
    const parentApp = express()
    parentApp.use((req, res, next) => {
      req.session = {}
      req.sessionStore = {
        get(sid) {
          expect(sid).to.equal('123')
          return {
            oAuthToken: 'fake-oauth-token',
            oAuthTokenSecret: 'fake-oauth-token-secret'
          }
        }
      }
      next()
    })
    parentApp.use(app)

    const response = await request(parentApp)
      .post('/api/attestations/twitter/verify')
      .send({
        identity: ethAddress,
        code: 'abcdefg',
        sid: 123
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
    expect(response.body.data.attestation.site.siteName).to.equal('twitter.com')
    expect(response.body.data.attestation.site.userId.raw).to.equal('12345')
    expect(response.body.data.attestation.site.username.raw).to.equal(
      'OriginProtocol'
    )
    expect(response.body.data.attestation.site.profileUrl.raw).to.equal(
      'https://twitter.com/OriginProtocol'
    )

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.TWITTER)
    expect(results[0].value).to.equal('12345')
    expect(results[0].username).to.equal('OriginProtocol')
    expect(results[0].profileUrl).to.equal('https://twitter.com/OriginProtocol')
    expect(results[0].profileData).to.eql(MOCK_PROFILE_DATA)
  })

  it('should generate attestation on valid verification code (from session)', async () => {
    nock('https://api.twitter.com')
      .post('/oauth/access_token')
      .reply(200)

    nock('https://api.twitter.com')
      .get('/1.1/account/verify_credentials.json')
      .reply(200, MOCK_PROFILE_DATA)

    // Fake a session
    const parentApp = express()
    parentApp.use((req, res, next) => {
      req.session = {}
      req.sessionStore = {
        get(sid) {
          expect(sid).to.equal('123')
          return {
            redirect: 'hello',
            code: 'abcdefg',
            oAuthToken: 'fake-oauth-token',
            oAuthTokenSecret: 'fake-oauth-token-secret'
          }
        }
      }
      next()
    })
    parentApp.use(app)

    const response = await request(parentApp)
      .post('/api/attestations/twitter/verify')
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
    expect(response.body.data.attestation.site.siteName).to.equal('twitter.com')
    expect(response.body.data.attestation.site.userId.raw).to.equal('12345')
    expect(response.body.data.attestation.site.username.raw).to.equal(
      'OriginProtocol'
    )
    expect(response.body.data.attestation.site.profileUrl.raw).to.equal(
      'https://twitter.com/OriginProtocol'
    )

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.TWITTER)
    expect(results[0].value).to.equal('12345')
    expect(results[0].username).to.equal('OriginProtocol')
    expect(results[0].profileUrl).to.equal('https://twitter.com/OriginProtocol')
    expect(results[0].profileData).to.eql(MOCK_PROFILE_DATA)
  })

  it('should error on incorrect verifier', async () => {
    nock('https://api.twitter.com')
      .post('/oauth/access_token')
      .reply(401)

    // Fake a session
    const parentApp = express()
    parentApp.use((req, res, next) => {
      req.session = {}
      next()
    })
    parentApp.use((req, res, next) => {
      req.session = {}
      req.sessionStore = {
        get(sid) {
          expect(sid).to.equal('123')
          return {
            oAuthToken: 'fake-oauth-token',
            oAuthTokenSecret: 'fake-oauth-token-secret',
            code: 'abcdefgh'
          }
        }
      }
      next()
    })
    parentApp.use(app)

    const response = await request(parentApp)
      .post('/api/attestations/twitter/verify')
      .send({
        identity: ethAddress,
        sid: '123'
      })
      .expect(401)

    expect(response.body.errors[0]).to.equal(
      'The oauth-verifier provided is invalid.'
    )
  })

  it('should error on missing session', async () => {
    const response = await request(app)
      .post('/api/attestations/twitter/verify')
      .send({
        identity: ethAddress
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Field sid must not be empty.')
  })

  it('should error on invalid session', async () => {
    // Fake a session
    const parentApp = express()
    parentApp.use((req, res, next) => {
      req.session = {}
      req.sessionStore = {
        get() {
          return null
        }
      }
      next()
    })
    parentApp.use(app)

    const response = await request(parentApp)
      .post('/api/attestations/twitter/verify')
      .send({
        identity: ethAddress,
        sid: '1234432'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Invalid Twitter oAuth session.')
  })

  it('should error if tokens missing in session', async () => {
    // Fake a session
    const parentApp = express()
    parentApp.use((req, res, next) => {
      req.session = {}
      req.sessionStore = {
        get() {
          return {}
        }
      }
      next()
    })
    parentApp.use(app)

    const response = await request(parentApp)
      .post('/api/attestations/twitter/verify')
      .send({
        identity: ethAddress,
        sid: '1234432'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Invalid Twitter oAuth session.')
  })
})
