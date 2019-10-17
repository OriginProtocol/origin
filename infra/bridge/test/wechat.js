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

describe('wechat attestations', () => {
  beforeEach(async () => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY = '0xc1912'
    process.env.WECHAT_CLIENT_ID = 'wechat-client-id'
    process.env.WECHAT_CLIENT_SECRET = 'wechat-client-secret'
    process.env.WECHAT_BASE_AUTH_URL =
      'https://open.weixin.qq.com/connect/qrconnect'
    process.env.WECHAT_BASE_API_URL = 'https://api.weixin.qq.com/sns'
    process.env.HOST = 'originprotocol.com'

    await Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a correct auth url', async () => {
    const response = await request(app)
      .get('/api/attestations/wechat/auth-url')
      .expect(200)

    const params = {
      appid: process.env.WECHAT_CLIENT_ID,
      response_type: 'code',
      redirect_uri: getAbsoluteUrl('/redirects/wechat/'),
      scope: 'snsapi_login,snsapi_userinfo'
    }

    expect(response.body.url).to.equal(
      `https://open.weixin.qq.com/connect/qrconnect?${querystring.stringify(
        params
      )}`
    )
  })

  it('should generate attestation on valid verification code', async () => {
    nock('https://api.weixin.qq.com')
      .post('/sns/oauth2/access_token')
      .query({
        appid: process.env.WECHAT_CLIENT_ID,
        secret: process.env.WECHAT_CLIENT_SECRET,
        code: 'abcdefg',
        grant_type: 'authorization_code'
      })
      .reply(200, { access_token: '12345', openid: 67890 })

    nock('https://api.weixin.qq.com')
      .get('/sns/userinfo')
      .query({
        access_token: '12345',
        openid: 67890
      })
      .reply(200, { unionid: 'Origin Protocol' })

    const response = await request(app)
      .post('/api/attestations/wechat/verify')
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
    expect(response.body.data.attestation.site.siteName).to.equal('wechat.com')
    expect(response.body.data.attestation.site.userId.raw).to.equal(
      'Origin Protocol'
    )

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.WECHAT)
    expect(results[0].value).to.equal('Origin Protocol')
  })

  it('should generate attestation on valid session', async () => {
    nock('https://api.weixin.qq.com')
      .post('/sns/oauth2/access_token')
      .query({
        appid: process.env.WECHAT_CLIENT_ID,
        secret: process.env.WECHAT_CLIENT_SECRET,
        code: 'abcdefg',
        grant_type: 'authorization_code',
        state: '123'
      })
      .reply(200, { access_token: '12345', openid: 67890 })

    nock('https://api.weixin.qq.com')
      .get('/sns/userinfo')
      .query({
        access_token: '12345',
        openid: 67890
      })
      .reply(200, { unionid: 'Origin Protocol' })
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
      .post('/api/attestations/wechat/verify')
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
    expect(response.body.data.attestation.site.siteName).to.equal('wechat.com')
    expect(response.body.data.attestation.site.userId.raw).to.equal(
      'Origin Protocol'
    )

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.WECHAT)
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
      .post('/api/attestations/wechat/verify')
      .send({
        identity: ethAddress,
        sid: '12345'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Invalid session')
  })

  it('should error on missing verification code and session id', async () => {
    const response = await request(app)
      .post('/api/attestations/wechat/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal(
      'Field `code` or `sid` must be specified.'
    )
  })
})
