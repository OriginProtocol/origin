'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

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
  before(async () => {
    await Identity.destroy({
      where: {},
      truncate: true
    })
  })

  it('should return 400 on a malformed ethAddress', async () => {
    const ethAddress = '0xdeadbeef'
    const response = await request(app).post(
      `/api/identity?ethAddress=${ethAddress}`
    )
    expect(response.status).to.equal(400)
  })

  it('should write a new identity', async () => {
    const ethAddress = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
    const data = {
      identity: {
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
      .send(data)
    expect(response.status).to.equal(200)
    expect(response.body.id).to.equal(ethAddress.toLowerCase())

    // Then read it.
    response = await request(app).get(`/api/identity?ethAddress=${ethAddress}`)
    expect(response.status).to.equal(200)
    const identity = response.body.identity
    expect(identity.profile.ethAddress).to.equal(ethAddress)
    expect(identity.profile.firstName).to.equal(data.identity.profile.firstName)
    expect(identity.profile.lastName).to.equal(data.identity.profile.lastName)
    expect(identity.profile.description).to.equal(
      data.identity.profile.description
    )
    expect(identity.profile.avatarUrl).to.equal(data.identity.profile.avatarUrl)
    expect(response.body.ipfsHash).to.equal(data.ipfsHash)
  })

  it('should update an existing identity', async () => {
    const ethAddress = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
    const data = {
      identity: {
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
      .send(data)
    expect(response.status).to.equal(200)
    expect(response.body.id).to.equal(ethAddress.toLowerCase())

    // Then read it.
    response = await request(app).get(`/api/identity?ethAddress=${ethAddress}`)
    expect(response.status).to.equal(200)
    const identity = response.body.identity
    expect(identity.profile.ethAddress).to.equal(ethAddress)
    expect(identity.profile.firstName).to.equal(data.identity.profile.firstName)
    expect(identity.profile.lastName).to.equal(data.identity.profile.lastName)
    expect(identity.profile.description).to.equal(
      data.identity.profile.description
    )
    expect(identity.profile.avatarUrl).to.equal(data.identity.profile.avatarUrl)
    expect(response.body.ipfsHash).to.equal(data.ipfsHash)
  })

  it('should update an existing identity when passed a proxy address', async () => {
    const ethAddress = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
    const proxy = '0x5b2A5d1AB8a5B83C0f22cB1Df372d23946aA7d8F'
    Proxy.upsert({
      address: proxy.toLowerCase(),
      ownerAddress: ethAddress.toLowerCase()
    })
    const data = {
      identity: {
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
      .send(data)
    expect(response.status).to.equal(200)
    expect(response.body.id).to.equal(ethAddress.toLowerCase())

    // Then read it using owner address.
    response = await request(app).get(`/api/identity?ethAddress=${ethAddress}`)
    expect(response.status).to.equal(200)
    const identity = response.body.identity
    expect(identity.profile.firstName).to.equal(data.identity.profile.firstName)
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
