'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const crypto = require('crypto')

const { generateToken, verifyToken } = require('@origin/auth-utils/src/utils')

const app = require('../src/app')

const Eth = require('web3-eth')

const stringify = require('json-stable-stringify')

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

describe('token generation', () => {
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
    process.env.SIGN_EXPIRES_IN = 15
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
    const data = await verifyToken(response.body.authToken)

    expect(data.address).to.equal(USER_ADDRESS)
    expect(data.expiresAt - data.issuedAt).to.equal(30 * 24 * 60 * 60 * 1000)
  })

  it('should fail if signature is invalid', async () => {
    const { signature } = signAuthMessage()
    const fakePayload = {
      message: 'fake',
      timestamp: Date.now()
    }

    const response = await request(app)
      .post(`/api/tokens`)
      .send({
        signature,
        payload: fakePayload,
        address: USER_ADDRESS
      })
      .expect(400)

    expect(response.body.success).to.be.false
    expect(response.body.errors[0]).to.equal('Failed to verify signature')
  })

  it('should fail if signer is different', async () => {
    const { signature, payload } = signAuthMessage()

    const response = await request(app)
      .post(`/api/tokens`)
      .send({
        signature,
        payload,
        address: '0xaaaaabbbbbaaaaabbbbbaaaaabbbbbaaaaabbbbb'
      })
      .expect(400)

    expect(response.body.success).to.be.false
    expect(response.body.errors[0]).to.equal('Failed to verify signature')
  })

  it('should fail if sign is older', async () => {
    const { signature, payload } = signAuthMessage(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    )

    const response = await request(app)
      .post(`/api/tokens`)
      .send({
        signature,
        payload,
        address: USER_ADDRESS
      })
      .expect(400)

    expect(response.body.success).to.be.false
    expect(response.body.errors[0]).to.equal('Failed to verify signature')
  })

  it('should fail if sign is in future', async () => {
    const { signature, payload } = signAuthMessage(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    )

    const response = await request(app)
      .post(`/api/tokens`)
      .send({
        signature,
        payload,
        address: USER_ADDRESS
      })
      .expect(400)

    expect(response.body.success).to.be.false
    expect(response.body.errors[0]).to.equal('Failed to verify signature')
  })
})

describe('token revoking', () => {
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
    process.env.SIGN_EXPIRES_IN = 15
  })

  it('should allow token to be revoked', async () => {
    const { authToken } = generateToken({
      address: USER_ADDRESS
    })

    const response = await request(app)
      .post(`/api/tokens/revoke`)
      .set({
        authorization: 'Bearer ' + authToken
      })
      .send({
        token: authToken
      })
      .expect(200)

    expect(response.body.success).to.be.true

    const response2 = await request(app)
      .get(`/api/tokens`)
      .set({
        authorization: 'Bearer ' + authToken
      })
      .expect(401)

    expect(response2.body.errors[0]).to.equal('Token has been revoked')
  })

  it('should fail if revoking from different address', async () => {
    const { authToken: tokenToRevoke } = generateToken({
      address: USER_ADDRESS
    })

    const { authToken } = generateToken({
      address: '0xaaaaabbbbbaaaaabbbbbaaaaabbbbbaaaaabbbbb'
    })

    const response = await request(app)
      .post(`/api/tokens/revoke`)
      .set({
        authorization: 'Bearer ' + authToken
      })
      .send({
        token: tokenToRevoke
      })
      .expect(403)

    expect(response.body.success).to.be.false

    expect(response.body.errors[0]).to.equal('Unauthorized to revoke token')
  })

  it('should fail if revoking invalid token', async () => {
    const tokenToRevoke = 'invalidToken'

    const { authToken } = generateToken({
      address: '0xaaaaabbbbbaaaaabbbbbaaaaabbbbbaaaaabbbbb'
    })

    const response = await request(app)
      .post(`/api/tokens/revoke`)
      .set({
        authorization: 'Bearer ' + authToken
      })
      .send({
        token: tokenToRevoke
      })
      .expect(400)

    expect(response.body.success).to.be.false

    expect(response.body.errors[0]).to.equal('Invalid token')
  })
})
