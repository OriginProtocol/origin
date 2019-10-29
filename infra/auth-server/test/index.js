'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/app')

const {
  AuthTokenGenerationLog,
  AuthTokenBlacklist
} = require('../src/models/index')

const Eth = require('web3-eth')

const stringify = require('json-stable-stringify')

const jwt = require('jsonwebtoken')

const express = require('express')

const redis = require('redis')
const client = redis.createClient()

const authMiddleware = require('../src/middlewares/auth')

const Web3Eth = new Eth()

// Just an account for testing purpose
const USER_ADDRESS = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
const USER_PRIVATE_KEY =
  '0xC87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3'
const USER_ACCOUNT = Web3Eth.accounts.privateKeyToAccount(USER_PRIVATE_KEY)

// The actual message that the client will sign along with an timestamp
const AUTH_MESSAGE = 'SOME_AUTH_MESSAGE'

const signAuthMessage = (timestamp = Date.now()) => {
  const payload = stringify({
    message: AUTH_MESSAGE,
    timestamp
  })

  return {
    signature: USER_ACCOUNT.sign(payload).signature,
    payload: JSON.parse(payload),
    timestamp
  }
}

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

const sleep = timeInMs => new Promise(resolve => setTimeout(resolve, timeInMs))

describe('auth server', () => {
  beforeEach(async () => {
    process.env.JWT_EXPIRE_IN = '10s'
    process.env.JWT_SECRET = 'origin'

    await AuthTokenBlacklist.destroy({
      where: {},
      truncate: true
    })
    await AuthTokenGenerationLog.destroy({
      where: {},
      truncate: true
    })
    await new Promise(resolve => client.flushall(resolve))
  })

  it('should generate an auth token', async () => {
    const { signature, payload } = signAuthMessage()

    const response = await request(app)
      .post(`/api/tokens`)
      .send({
        signature,
        payload,
        address: USER_ADDRESS
      })
      .expect(201)

    expect(response.body.success).to.be.true
    const data = jwt.verify(response.body.authToken, 'origin')

    expect(data.address).to.equal(USER_ADDRESS)
    expect(data.signature).to.equal(signature)
    expect(data.payload).to.deep.equal(payload)
    expect(data.exp - data.iat).to.equal(10)
  })

  it('should allow token to be revoked', async () => {
    const token = jwt.sign(
      {
        signature: 'signature',
        payload: 'some payload',
        address: USER_ADDRESS
      },
      'origin'
    )

    const response = await request(app)
      .post(`/api/tokens/revoke`)
      .set({
        authorization: 'Bearer ' + token
      })
      .send({
        token
      })
      .expect(200)

    expect(response.body.success).to.be.true
  })
})

describe('auth server middleware', () => {
  beforeEach(async () => {
    process.env.JWT_EXPIRE_IN = '1s'
    process.env.JWT_SECRET = 'origin'

    await AuthTokenBlacklist.destroy({
      where: {},
      truncate: true
    })
    await AuthTokenGenerationLog.destroy({
      where: {},
      truncate: true
    })
    await new Promise(resolve => client.flushall(resolve))
  })

  it('should populate auth data if token is valid', async () => {
    const token = jwt.sign(
      {
        signature: 'signature',
        payload: 'some payload',
        address: USER_ADDRESS
      },
      'origin'
    )

    const response = await request(getRouterWithAuthMiddleware())
      .get('/')
      .set({
        authorization: 'Bearer ' + token
      })
      .expect(200)

    expect(response.body.success).to.be.true
    expect(response.body.authData).to.deep.equal({
      signature: 'signature',
      payload: 'some payload',
      address: USER_ADDRESS
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

  it('should fail if token is invalid', async () => {
    const response = await request(getRouterWithAuthMiddleware())
      .get('/')
      .set({
        authorization: 'Bearer invalid-token'
      })
      .expect(401)

    expect(response.body).to.deep.equal({
      errors: ['Invalid token']
    })
  })

  it('should fail if token has expired', async () => {
    const token = jwt.sign(
      {
        signature: 'signature',
        payload: 'some payload',
        address: USER_ADDRESS
      },
      'origin'
    )

    const router = getRouterWithAuthMiddleware()

    // Confirm token is valid
    await request(router)
      .get('/')
      .set({
        authorization: 'Bearer ' + token
      })
      .expect(200)

    // Wait until token expires
    await sleep(1000)

    const response = await request(router)
      .get('/')
      .set({
        authorization: 'Bearer ' + token
      })
      .expect(401)

    expect(response.body).to.deep.equal({
      errors: ['Invalid token']
    })
  })
})
