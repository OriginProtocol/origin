'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const crypto = require('crypto')
const stringify = require('json-stable-stringify')

const { Identity, Proxy } = require('@origin/identity/src/models')
const app = require('../src/app')

const baseIdentity = {
  ethAddress: '0x000a'
}

describe('Identity read', () => {
  before(async () => {
    await Identity.destroy({ where: {}, truncate: true })
    await Proxy.destroy({ where: {}, truncate: true })
  })

  it('should return 400 on a malformed ethAddress', async () => {
    const ethAddress = '0xdeadbeef'
    const response = await request(app).get(
      `/api/identity?ethAddress=${ethAddress}`
    )
    expect(response.status).to.equal(400)
  })

  it('should return 204 on inexistent identity', async () => {
    const ethAddress = '0xD85A569F3C26f81070544451131c742283360400'
    const response = await request(app).get(
      `/api/identity?ethAddress=${ethAddress}`
    )
    expect(response.status).to.equal(204)
  })

  it('should return 200 on existing identity', async () => {
    const ethAddress = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
    const identity = {
      ethAddress: ethAddress.toLowerCase(),
      email: 'foobar@originprotocol.com',
      data: {
        identity: {},
        ipfsHash: '123',
        ipfsHashHistory: []
      }
    }
    await Identity.upsert(identity)

    const response = await request(app).get(
      `/api/identity?ethAddress=${ethAddress}`
    )
    expect(response.status).to.equal(200)
  })

  it('should return 200 when called with a proxy address', async () => {
    const ethAddress = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
    const identity = {
      ethAddress: ethAddress.toLowerCase(),
      email: 'foobar@originprotocol.com',
      data: {
        identity: {},
        ipfsHash: '123',
        ipfsHashHistory: []
      }
    }
    await Identity.upsert(identity)
    const proxy = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
    Proxy.upsert({
      address: proxy.toLowerCase(),
      ownerAddress: ethAddress.toLowerCase()
    })

    const response = await request(app).get(`/api/identity?ethAddress=${proxy}`)
    expect(response.status).to.equal(200)
  })
})

describe('Identity write', () => {
  const ethAddress = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
  const proxy = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
  let token

  before(async () => {
    await Identity.destroy({
      where: {},
      truncate: true
    })

    // Configure key for the authentication.
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

    // Generate an authentication token.
    const issuedAt = Date.now()
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000
    token = crypto
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
  })

  it('should return 401 on a request with no auth token', async () => {
    const response = await request(app).post(
      `/api/identity?ethAddress=${ethAddress}`
    )
    expect(response.status).to.equal(401)
  })

  it('should return 400 on a malformed ethAddress', async () => {
    const badEthAddress = '0xdeadbeef'
    const response = await request(app)
      .post(`/api/identity?ethAddress=${badEthAddress}`)
      .set({ authorization: 'Bearer ' + token })
    expect(response.status).to.equal(400)
  })

  it(`should return 403 on a write for another user's identity`, async () => {
    const otherUserAddress = '0x02187070dc76d66055a1109833EB79647193021d'
    const data = {
      ipfsData: {
        schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json',
        profile: {
          firstName: 'Somebody',
          lastName: 'Else',
          description: 'Not my account!',
          avatarUrl: 'ipfs://avatarIpfsHash',
          schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
          ethAddress: ethAddress
        },
        attestations: []
      },
      ipfsHash: 'NotMyIdentityIpfsHash'
    }
    const response = await request(app)
      .post(`/api/identity?ethAddress=${otherUserAddress}`)
      .set({ authorization: 'Bearer ' + token })
      .send(data)
    expect(response.status).to.equal(403)
  })

  it('should write a new identity', async () => {
    const data = {
      ipfsData: {
        schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json',
        profile: {
          firstName: 'Francky',
          lastName: 'Balboa',
          description: 'I am a test account!',
          avatarUrl: 'ipfs://avatarIpfsHash',
          schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
          ethAddress: ethAddress
        },
        attestations: []
      },
      ipfsHash: 'identityIpfsHash'
    }
    // Write the identity.
    let response = await request(app)
      .post(`/api/identity?ethAddress=${ethAddress}`)
      .set({ authorization: 'Bearer ' + token })
      .send(data)
    expect(response.status).to.equal(200)
    expect(response.body.ethAddress).to.equal(ethAddress.toLowerCase())

    // Then read it.
    response = await request(app).get(`/api/identity?ethAddress=${ethAddress}`)
    expect(response.status).to.equal(200)
    const identity = response.body.identity
    expect(identity.profile.ethAddress).to.equal(ethAddress)
    expect(identity.profile.firstName).to.equal(data.ipfsData.profile.firstName)
    expect(identity.profile.lastName).to.equal(data.ipfsData.profile.lastName)
    expect(identity.profile.description).to.equal(
      data.ipfsData.profile.description
    )
    expect(identity.profile.avatarUrl).to.equal(data.ipfsData.profile.avatarUrl)
    expect(response.body.ipfsHash).to.equal(data.ipfsHash)
  })

  it('should update an existing identity', async () => {
    const data = {
      ipfsData: {
        schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json',
        profile: {
          firstName: 'New Francky',
          lastName: 'New Balboa',
          description: 'I am a test account!',
          avatarUrl: 'ipfs://avatarIpfsHash',
          schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
          ethAddress: ethAddress
        },
        attestations: []
      },
      ipfsHash: 'identityIpfsHash'
    }
    // Update the identity.
    let response = await request(app)
      .post(`/api/identity?ethAddress=${ethAddress}`)
      .set({ authorization: 'Bearer ' + token })
      .send(data)
    expect(response.status).to.equal(200)
    expect(response.body.ethAddress).to.equal(ethAddress.toLowerCase())

    // Then read it.
    response = await request(app).get(`/api/identity?ethAddress=${ethAddress}`)
    expect(response.status).to.equal(200)
    const identity = response.body.identity
    expect(identity.profile.ethAddress).to.equal(ethAddress)
    expect(identity.profile.firstName).to.equal(data.ipfsData.profile.firstName)
    expect(identity.profile.lastName).to.equal(data.ipfsData.profile.lastName)
    expect(identity.profile.description).to.equal(
      data.ipfsData.profile.description
    )
    expect(identity.profile.avatarUrl).to.equal(data.ipfsData.profile.avatarUrl)
    expect(response.body.ipfsHash).to.equal(data.ipfsHash)
  })

  it('should update an existing identity when passed a proxy address', async () => {
    Proxy.upsert({
      address: proxy.toLowerCase(),
      ownerAddress: ethAddress.toLowerCase()
    })
    const data = {
      ipfsData: {
        schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json',
        profile: {
          firstName: 'Proxy Francky',
          lastName: 'Proxy Balboa',
          description: 'I am a proxy test!',
          avatarUrl: 'ipfs://avatarIpfsHash',
          schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
          ethAddress: ethAddress
        },
        attestations: []
      },
      ipfsHash: 'identityIpfsHash'
    }
    // Update the identity using the proxy address.
    let response = await request(app)
      .post(`/api/identity?ethAddress=${proxy}`)
      .set({ authorization: 'Bearer ' + token })
      .send(data)
    expect(response.status).to.equal(200)
    expect(response.body.ethAddress).to.equal(ethAddress.toLowerCase())

    // Then read it using owner address.
    response = await request(app).get(`/api/identity?ethAddress=${ethAddress}`)
    expect(response.status).to.equal(200)
    const identity = response.body.identity
    expect(identity.profile.firstName).to.equal(data.ipfsData.profile.firstName)
  })
})

describe('Identity exists', () => {
  beforeEach(async () => {
    await Identity.destroy({
      where: {},
      truncate: true
    })
  })

  it('should return 200 for existing email', async () => {
    const obj = { email: 'foobar@originprotocol.com' }

    await Identity.create({ ...obj, ...baseIdentity })

    const response = await request(app)
      .post('/utils/exists')
      .send(obj)

    expect(response.status).to.equal(200)
  })

  it('should return 200 for existing phone', async () => {
    const obj = { phone: '1234567' }

    await Identity.create({ ...obj, ...baseIdentity })

    const response = await request(app)
      .post('/utils/exists')
      .send(obj)

    expect(response.status).to.equal(200)
  })

  it('should return 204 for non-existent email', async () => {
    const response = await request(app)
      .post('/utils/exists')
      .send({ email: 'foobar@originprotocol.com' })

    expect(response.status).to.equal(204)
  })

  it('should return 204 for existing email that exists on first created identity', async () => {
    const obj = { email: 'foobar@originprotocol.com' }

    await Identity.create({ ...obj, ...baseIdentity })
    await Identity.create({ ...obj, ethAddress: '0xabcd1234' })

    const response = await request(app)
      .post('/utils/exists')
      .send({
        email: 'foobar@originprotocol.com',
        ethAddress: baseIdentity.ethAddress
      })

    expect(response.status).to.equal(204)
  })

  it('should return 200 for existing email that exists on second created identity', async () => {
    const obj = { email: 'foobar@originprotocol.com' }

    await Identity.create({ ...obj, ethAddress: '0xabcd1234' })
    await Identity.create({ ...obj, ...baseIdentity })

    const response = await request(app)
      .post('/utils/exists')
      .send({
        email: 'foobar@originprotocol.com',
        ethAddress: baseIdentity.ethAddress
      })

    expect(response.status).to.equal(200)
  })

  it('should return 204 for non-existent phone', async () => {
    const response = await request(app)
      .post('/utils/exists')
      .send({ phone: '1234567' })

    expect(response.status).to.equal(204)
  })

  it('should return 400 for bad request', async () => {
    const response = await request(app)
      .post('/utils/exists')
      .send({ foo: 'bar' })

    expect(response.status).to.equal(400)
  })
})
