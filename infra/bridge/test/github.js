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

describe('github attestations', () => {
  beforeEach(async () => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY = '0xc1912'
    process.env.GITHUB_CLIENT_ID = 'github-client-id'
    process.env.GITHUB_CLIENT_SECRET = 'github-client-secret'
    process.env.GITHUB_BASE_AUTH_URL = 'https://github.com/login/oauth'
    process.env.GITHUB_PROFILE_URL = 'https://api.github.com/user'
    process.env.HOST = 'originprotocol.com'

    await Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a correct auth url', async () => {
    const response = await request(app)
      .get('/api/attestations/github/auth-url')
      .expect(200)

    const params = {
      client_id: process.env.GITHUB_CLIENT_ID,
      response_type: 'code',
      redirect_uri: getAbsoluteUrl('/redirects/github/')
    }

    expect(response.body.url).to.equal(
      `https://github.com/login/oauth/authorize?${querystring.stringify(
        params
      )}`
    )
  })

  it('should generate attestation on valid verification code', async () => {
    nock('https://github.com')
      .matchHeader('User-Agent', 'OriginProtocol')
      .post('/login/oauth/access_token')
      .query({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: getAbsoluteUrl('/redirects/github/'),
        code: 'abcdefg'
      })
      .reply(200, { access_token: '12345' })

    nock('https://api.github.com')
      .matchHeader('Authorization', 'token 12345')
      .matchHeader('User-Agent', 'OriginProtocol')
      .get('/user')
      .reply(200, {
        id: '67890',
        login: 'OriginProtocol',
        html_url: 'https://github.com/OriginProtocol'
      })

    const response = await request(app)
      .post('/api/attestations/github/verify')
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
    expect(response.body.data.attestation.site.siteName).to.equal('github.com')
    expect(response.body.data.attestation.site.userId.raw).to.equal('67890')
    expect(response.body.data.attestation.site.username.raw).to.equal(
      'OriginProtocol'
    )
    expect(response.body.data.attestation.site.profileUrl.raw).to.equal(
      'https://github.com/OriginProtocol'
    )

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.GITHUB)
    expect(results[0].value).to.equal('67890')
    expect(results[0].username).to.equal('OriginProtocol')
    expect(results[0].profileUrl).to.equal('https://github.com/OriginProtocol')
  })

  it('should generate attestation on valid session', async () => {
    nock('https://github.com')
      .matchHeader('User-Agent', 'OriginProtocol')
      .post('/login/oauth/access_token')
      .query({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: getAbsoluteUrl('/redirects/github/'),
        code: 'abcdefg',
        state: '123'
      })
      .reply(200, { access_token: '12345' })

    nock('https://api.github.com')
      .matchHeader('Authorization', 'token 12345')
      .matchHeader('User-Agent', 'OriginProtocol')
      .get('/user')
      .reply(200, {
        id: '67890',
        login: 'OriginProtocol',
        html_url: 'https://github.com/OriginProtocol'
      })

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
      .post('/api/attestations/github/verify')
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
    expect(response.body.data.attestation.site.siteName).to.equal('github.com')
    expect(response.body.data.attestation.site.userId.raw).to.equal('67890')
    expect(response.body.data.attestation.site.username.raw).to.equal(
      'OriginProtocol'
    )
    expect(response.body.data.attestation.site.profileUrl.raw).to.equal(
      'https://github.com/OriginProtocol'
    )

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.GITHUB)
    expect(results[0].value).to.equal('67890')
    expect(results[0].username).to.equal('OriginProtocol')
    expect(results[0].profileUrl).to.equal('https://github.com/OriginProtocol')
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
      .post('/api/attestations/github/verify')
      .send({
        identity: ethAddress,
        sid: '12345'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Invalid session')
  })

  it('should error on missing verification code and session id', async () => {
    const response = await request(app)
      .post('/api/attestations/github/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal(
      'Field `code` or `sid` must be specified.'
    )
  })
})
