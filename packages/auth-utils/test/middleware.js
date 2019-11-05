'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const crypto = require('crypto')
const stringify = require('json-stable-stringify')

const express = require('express')

const authMiddleware = require('../src/middleware/auth')

const ethAddress = '0x1111122222111112222211111222221111122222'

let lastUsedApp
const getRouterWithAuthMiddleware = () => {
  if (lastUsedApp) {
    return lastUsedApp
  }

  const app = express()

  app.use(express.json())

  app.get('/', authMiddleware, (req, res) => {
    res.status(200).send({
      success: true,
      authData: req.__originAuth
    })
  })

  app.listen(5299)

  lastUsedApp = app

  return app
}

describe('auth server middleware', () => {
  beforeEach(async () => {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: ''
      }
    })

    process.env.AUTH_PRIV_KEY = keyPair.privateKey
    process.env.AUTH_PUB_KEY = keyPair.publicKey
    process.env.TOKEN_EXPIRES_IN = 30
  })

  it('should populate auth data if token is valid', async () => {
    const issuedAt = Date.now()
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000

    const token = crypto
      .privateEncrypt(
        process.env.AUTH_PRIV_KEY,
        Buffer.from(
          stringify({
            address: ethAddress,
            issuedAt,
            expiresAt
          })
        )
      )
      .toString('hex')

    const response = await request(getRouterWithAuthMiddleware())
      .get('/')
      .set({
        authorization: 'Bearer ' + token
      })
      .expect(200)

    expect(response.body.success).to.be.true
    expect(response.body.authData).to.deep.equal({
      address: ethAddress,
      issuedAt,
      expiresAt
    })
  })

  it('should fail if no token is present', async () => {
    const response = await request(getRouterWithAuthMiddleware())
      .get('/')
      .expect(401)

    expect(response.body).to.deep.equal({
      errors: ['Authorization required']
    })
  })

  it('should fail if no token type is invalid', async () => {
    const response = await request(getRouterWithAuthMiddleware())
      .get('/')
      .set({
        authorization: 'Invalid token'
      })
      .expect(401)

    expect(response.body).to.deep.equal({
      errors: [`Expected 'Bearer' token but got 'Invalid'`]
    })
  })

  it('should fail if token is not in hex', async () => {
    const response = await request(getRouterWithAuthMiddleware())
      .get('/')
      .set({
        authorization: 'Bearer invalid-token'
      })
      .expect(401)

    expect(response.body).to.deep.equal({
      errors: ['`authToken` is not in valid format']
    })
  })

  it('should fail if token is invalid', async () => {
    const response = await request(getRouterWithAuthMiddleware())
      .get('/')
      .set({
        authorization: 'Bearer baddeed'
      })
      .expect(401)

    expect(response.body).to.deep.equal({
      errors: ['Failed to verify token']
    })
  })

  it('should fail if token has expired', async () => {
    const issuedAt = Date.now()
    const expiresAt = issuedAt - 30 * 24 * 60 * 60 * 1000

    const token = crypto
      .privateEncrypt(
        process.env.AUTH_PRIV_KEY,
        Buffer.from(
          stringify({
            address: ethAddress,
            issuedAt,
            expiresAt
          })
        )
      )
      .toString('hex')

    const router = getRouterWithAuthMiddleware()

    const response = await request(router)
      .get('/')
      .set({
        authorization: 'Bearer ' + token
      })
      .expect(401)

    expect(response.body).to.deep.equal({
      errors: ['Token has expired']
    })
  })
})
