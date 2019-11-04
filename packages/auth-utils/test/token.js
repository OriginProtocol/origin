'use strict'

const chai = require('chai')
const expect = chai.expect

const crypto = require('crypto')
const stringify = require('json-stable-stringify')

const {
  generateToken,
  verifyToken,
  tokenBlacklist
} = require('../src/utils/index')

const { AuthTokenBlacklist } = require('../src/models')

const ethAddress = '0x1111122222111112222211111222221111122222'

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

    await AuthTokenBlacklist.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a valid token', () => {
    const { authToken, expiresAt, issuedAt } = generateToken({
      address: ethAddress
    })

    // Verify generated token
    let tokenData = crypto
      .publicDecrypt(process.env.AUTH_PUB_KEY, Buffer.from(authToken, 'hex'))
      .toString('utf-8')

    tokenData = JSON.parse(tokenData)

    expect(tokenData.address).to.equal(ethAddress)
    expect(tokenData.expiresAt).to.equal(expiresAt)
    expect(tokenData.issuedAt).to.equal(issuedAt)

    expect(expiresAt).to.equal(issuedAt + 30 * 24 * 60 * 60 * 1000)
  })

  it('should throw if no address is specified', () => {
    expect(() => generateToken()).to.throw('`address` field is required')
  })

  it('should throw if invalid address is specified', () => {
    expect(() =>
      generateToken({
        address: 'hello'
      })
    ).to.throw('`address` should be a valid Ethereum address')
  })
})

describe('token verification', () => {
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

    await AuthTokenBlacklist.destroy({
      where: {},
      truncate: true
    })
  })

  it('should return payload for a valid token', async () => {
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

    const tokenData = await verifyToken(token)

    expect(tokenData.address).to.equal(ethAddress)
    expect(tokenData.expiresAt).to.equal(expiresAt)
    expect(tokenData.issuedAt).to.equal(issuedAt)
  })

  it('should throw if no token  is specified', async () => {
    let error
    try {
      await verifyToken()
    } catch (err) {
      error = err
    }

    expect(error.message).to.equal('`authToken` is required')
  })

  it('should throw if token has expired', async () => {
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

    let error
    try {
      await verifyToken(token)
    } catch (err) {
      error = err
    }

    expect(error.message).to.equal('Token has expired')
  })

  it('should throw if token not in hex', async () => {
    let error
    try {
      await verifyToken('test')
    } catch (err) {
      error = err
    }

    expect(error.message).to.equal('`authToken` is not in valid format')
  })

  it('should throw if invalid token', async () => {
    let error
    try {
      await verifyToken('deadbeef')
    } catch (err) {
      error = err
    }

    expect(error.message).to.not.null
  })
})

describe('token blacklist', () => {
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

    await AuthTokenBlacklist.destroy({
      where: {},
      truncate: true
    })
  })

  it('should blacklist a token', async () => {
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

    await tokenBlacklist.revokeToken(token, ethAddress, 'test')

    // Verify
    const entry = await AuthTokenBlacklist.findOne({
      where: {
        authToken: token
      }
    })

    expect(entry).to.be.not.null.and.not.undefined
    expect(entry.authToken).to.equal(token)
    expect(entry.revokedBy).to.equal(ethAddress.toLowerCase())
    expect(entry.reason).to.equal('test')
  })

  it('should status of a blacklisted token', async () => {
    const token = 'abcdef'

    await AuthTokenBlacklist.create({
      authToken: token,
      revokedBy: ethAddress.toLowerCase(),
      reason: 'wxyz'
    })

    const blacklisted = await tokenBlacklist.isBlacklisted(token)

    expect(blacklisted).to.be.true
  })

  it('should throw if token not in hex', async () => {
    let error
    try {
      await tokenBlacklist.revokeToken('test', ethAddress, 'test')
    } catch (err) {
      error = err
    }

    expect(error.message).to.equal('`authToken` is not in valid format')
  })

  it('should throw if invalid token', async () => {
    let error
    try {
      await tokenBlacklist.revokeToken('deadbeef', ethAddress, 'test')
    } catch (err) {
      error = err
    }

    expect(error.message).to.not.null
  })
})
