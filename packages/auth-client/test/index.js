const chai = require('chai')
const expect = chai.expect
const nock = require('nock')
const Eth = require('web3-eth')

const stringify = require('json-stable-stringify')

global.fetch = require('cross-fetch')

const Web3 = require('web3')

import services from './_services'
import AuthClient from '../src/auth-client'

let servicesShutdown

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const Web3Eth = new Eth()

const USER_ADDRESS = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
const USER_PRIVATE_KEY =
  '0xC87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3'
const USER_ACCOUNT = Web3Eth.accounts.privateKeyToAccount(USER_PRIVATE_KEY)

const AUTH_SERVER_HOST = 'https://auth.originprotocol.com'

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

const localStorageMock = () => {
  const map = new Map()

  return {
    getItem: key => map.get(key),
    removeItem: key => map.delete(key),
    setItem: (key, value) => map.set(key, value),
    has: key => map.has(key)
  }
}

// Setup services
before(async function() {
  this.timeout(30000)
  servicesShutdown = await services()
})

describe('Auth Client', () => {
  it('should create an instance', () => {
    new AuthClient({
      authServer: AUTH_SERVER_HOST,
      disablePersistence: true
    })
  })

  it('should generate a token', async () => {
    const { signature, payload } = signAuthMessage()

    nock(AUTH_SERVER_HOST)
      .post('/api/tokens', {
        payload,
        signature,
        address: USER_ADDRESS
      })
      .reply(201, {
        success: true,
        authToken: 'Hello Token'
      })

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      disablePersistence: true
    })

    const { authToken } = await client.getTokenWithSignature(
      USER_ADDRESS,
      signature,
      payload
    )

    expect(authToken).to.equal('Hello Token')
  })

  it('should throw if failed to generate token', async () => {
    const { signature, payload } = signAuthMessage()

    nock(AUTH_SERVER_HOST)
      .post('/api/tokens', {
        payload,
        signature,
        address: USER_ADDRESS
      })
      .reply(200, {
        success: false,
        errors: ['Some error']
      })

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      disablePersistence: true
    })

    let error
    try {
      await client.getTokenWithSignature(USER_ADDRESS, signature, payload)
    } catch (err) {
      error = err
    }

    expect(error).not.undefined
    expect(error.message).to.equal('Some error')
  })

  it('should allow to login with sign', async () => {
    const { signature, payload } = signAuthMessage()

    nock(AUTH_SERVER_HOST)
      .post('/api/tokens', {
        payload,
        signature,
        address: USER_ADDRESS
      })
      .reply(201, {
        success: true,
        authToken: 'Hello Token',
        expiresAt: 1,
        issuedAt: 2
      })

    global.window = {
      localStorage: localStorageMock()
    }

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    await client.loginWithSign(USER_ADDRESS, signature, payload)

    expect(global.window.localStorage.getItem(`auth:${USER_ADDRESS}`)).to.equal(
      JSON.stringify({
        success: true,
        authToken: 'Hello Token',
        expiresAt: 1,
        issuedAt: 2
      })
    )
  })

  it('should allow to inject sign and login', async () => {
    const { signature, payload } = signAuthMessage()

    nock(AUTH_SERVER_HOST)
      .post('/api/tokens', {
        payload,
        signature,
        address: USER_ADDRESS
      })
      .reply(201, {
        success: true,
        authToken: 'Hello Token',
        expiresAt: 1,
        issuedAt: 2
      })

    global.window = {
      localStorage: localStorageMock()
    }

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    await client.onAuthSign(USER_ADDRESS, signature, payload)

    expect(global.window.localStorage.getItem(`auth:${USER_ADDRESS}`)).to.equal(
      JSON.stringify({
        success: true,
        authToken: 'Hello Token',
        expiresAt: 1,
        issuedAt: 2
      })
    )
  })

  it('should skip login if valid token exists', async () => {
    const { signature, payload } = signAuthMessage()

    global.window = {
      localStorage: localStorageMock()
    }

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    global.window.localStorage.setItem(
      `auth:${USER_ADDRESS}`,
      '{"authToken":"Hello2"}'
    )

    await client.onAuthSign(USER_ADDRESS, signature, payload)

    expect(global.window.localStorage.getItem(`auth:${USER_ADDRESS}`)).to.equal(
      '{"authToken":"Hello2"}'
    )
  })

  it('should prompt for sign and login', async () => {
    nock(AUTH_SERVER_HOST)
      .post('/api/tokens')
      .reply(201, {
        success: true,
        authToken: 'Hello Token',
        expiresAt: 1,
        issuedAt: 2
      })

    global.window = {
      localStorage: localStorageMock()
    }

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    await client.login(USER_ADDRESS, 'Authorize')

    expect(global.window.localStorage.getItem(`auth:${USER_ADDRESS}`)).to.equal(
      JSON.stringify({
        success: true,
        authToken: 'Hello Token',
        expiresAt: 1,
        issuedAt: 2
      })
    )
  })

  it('should clear localStorage cache on logout', () => {
    global.window = {
      localStorage: localStorageMock()
    }

    global.window.localStorage.setItem(
      `auth:${USER_ADDRESS}`,
      '{"authToken":"Hello2"}'
    )

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    client.logout(USER_ADDRESS)

    expect(global.window.localStorage.has(`auth:${USER_ADDRESS}`)).to.be.false
  })

  it('should check validity of a token', () => {
    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    let validity

    // Valid and non-expired token
    validity = client.checkTokenValidity({
      expiresAt: Date.now() + 100000000
    })

    expect(validity.valid).to.be.true
    expect(validity.willExpire).to.be.false

    // Valid but will expire soon
    validity = client.checkTokenValidity({
      expiresAt: Date.now() + 60000
    })

    expect(validity.valid).to.be.true
    expect(validity.willExpire).to.be.true

    // Expired token
    validity = client.checkTokenValidity({
      expiresAt: Date.now() - 5000
    })

    expect(validity.valid).to.be.false
    expect(validity.expired).to.be.true

    // Invalid token
    validity = client.checkTokenValidity()

    expect(validity.valid).to.be.false
  })

  it('should return logged in status', () => {
    global.window = {
      localStorage: localStorageMock()
    }

    global.window.localStorage.setItem(
      `auth:${USER_ADDRESS}`,
      JSON.stringify({
        expiresAt: Date.now() + 120000
      })
    )

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    expect(client.isLoggedIn(USER_ADDRESS)).to.be.true
  })

  it('should consider not logged in if token is invalid/expired', () => {
    global.window = {
      localStorage: localStorageMock()
    }

    global.window.localStorage.setItem(
      `auth:${USER_ADDRESS}`,
      JSON.stringify({
        expiresAt: Date.now() - 120000
      })
    )

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    expect(client.isLoggedIn(USER_ADDRESS)).to.be.false
  })

  it('should return auth token if logged in', () => {
    global.window = {
      localStorage: localStorageMock()
    }

    global.window.localStorage.setItem(
      `auth:${USER_ADDRESS}`,
      JSON.stringify({
        expiresAt: Date.now() + 120000,
        authToken: 'test token'
      })
    )

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    expect(client.getAccessToken(USER_ADDRESS)).to.equal('test token')
  })

  it('should not return auth token if not logged in', () => {
    global.window = {
      localStorage: localStorageMock()
    }

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    expect(client.getAccessToken(USER_ADDRESS)).to.be.null
  })

  it('should return auth token if token has expired', () => {
    global.window = {
      localStorage: localStorageMock()
    }

    global.window.localStorage.setItem(
      `auth:${USER_ADDRESS}`,
      JSON.stringify({
        expiresAt: Date.now() - 120000,
        authToken: 'test token'
      })
    )

    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      web3,
      personalSign: false
    })

    expect(client.getAccessToken(USER_ADDRESS)).to.be.null
  })
})

after(async function() {
  await servicesShutdown()
})
