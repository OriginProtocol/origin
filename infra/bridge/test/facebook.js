'use strict'

const crypto = require('crypto')
const chai = require('chai')
const expect = chai.expect
const express = require('express')
const nock = require('nock')
const request = require('supertest')
const querystring = require('querystring')

const Attestation = require('../src/models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')
const { getAbsoluteUrl } = require('../src/utils')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'

describe('facebook attestations', () => {
  beforeEach(async () => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY = '0xc1912'
    process.env.FACEBOOK_CLIENT_ID = 'facebook-client-id'
    process.env.FACEBOOK_CLIENT_SECRET = 'facebook-client-secret'
    process.env.FACEBOOK_BASE_GRAPH_URL = 'https://graph.facebook.com'
    process.env.HOST = 'originprotocol.com'

    await Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a correct auth url', async () => {
    const response = await request(app)
      .get('/api/attestations/facebook/auth-url')
      .expect(200)

    const params = {
      client_id: process.env.FACEBOOK_CLIENT_ID,
      redirect_uri: getAbsoluteUrl('/redirects/facebook/')
    }

    expect(response.body.url).to.equal(
      `https://www.facebook.com/v3.2/dialog/oauth?${querystring.stringify(
        params
      )}`
    )
  })

  it('should generate attestation on valid verification code', async () => {
    nock(process.env.FACEBOOK_BASE_GRAPH_URL)
      .get('/v3.2/oauth/access_token')
      .query({
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: getAbsoluteUrl('/redirects/facebook/'),
        code: 'abcdefg'
      })
      .reply(200, { access_token: '12345' })

    const appSecretProof = crypto
      .createHmac('sha256', process.env.FACEBOOK_CLIENT_SECRET)
      .update('12345')
      .digest('hex')

    nock(process.env.FACEBOOK_BASE_GRAPH_URL)
      .get('/me')
      .query({
        appsecret_proof: appSecretProof,
        access_token: '12345'
      })
      .reply(200, { id: '67890', name: 'Origin Protocol' })

    const response = await request(app)
      .post('/api/attestations/facebook/verify')
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
      'facebook.com'
    )
    expect(response.body.data.attestation.site.userId.raw).to.equal('67890')

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.FACEBOOK)
    expect(results[0].value).to.equal('67890')
  })

  it('should generate attestation on valid session', async () => {
    nock(process.env.FACEBOOK_BASE_GRAPH_URL)
      .get('/v3.2/oauth/access_token')
      .query({
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: getAbsoluteUrl('/redirects/facebook/'),
        code: 'abcdefg',
        state: '123'
      })
      .reply(200, { access_token: '12345' })

    const appSecretProof = crypto
      .createHmac('sha256', process.env.FACEBOOK_CLIENT_SECRET)
      .update('12345')
      .digest('hex')

    nock(process.env.FACEBOOK_BASE_GRAPH_URL)
      .get('/me')
      .query({
        appsecret_proof: appSecretProof,
        access_token: '12345'
      })
      .reply(200, { id: '67890', name: 'Origin Protocol' })

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
      .post('/api/attestations/facebook/verify')
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
      'facebook.com'
    )
    expect(response.body.data.attestation.site.userId.raw).to.equal('67890')

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.FACEBOOK)
    expect(results[0].value).to.equal('67890')
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
      .post('/api/attestations/facebook/verify')
      .send({
        identity: ethAddress,
        sid: '12345'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Invalid session')
  })

  it('should error on missing verification code and session id', async () => {
    const response = await request(app)
      .post('/api/attestations/facebook/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal(
      'Field `code` or `sid` must be specified.'
    )
  })
})
