'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const redis = require('redis')

const Attestation = require('../src/models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes

const app = require('../src/app')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'
const client = redis.createClient()

describe('promotion verifications', () => {
  beforeEach(async () => {
    // Reduce poll interval for tests
    process.env.VERIFICATION_POLL_INTERVAL = 100
    process.env.VERIFICATION_MAX_TRIES = 3

    // Clear out redis-mock
    await new Promise(resolve => client.del('*', resolve))

    Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should resolve on valid verification for `follow` event on twitter', async () => {
    // Create a dummy attestation
    await Attestation.create({
      method: AttestationTypes.TWITTER,
      ethAddress,
      value: '12345',
      signature: '0x0',
      remoteUpAddress: '192.168.1.1',
      profileUrl: '/',
      username: 'OriginProtocol'
    })

    // Push a fake event to redis
    client.set(`twitter/follow/12345`, '{}', 'EX', 60)

    const response = await request(app)
      .post('/api/promotions/verify')
      .send({
        type: 'FOLLOW',
        socialNetwork: 'TWITTER',
        identity: ethAddress,
        identityProxy: ethAddress
      })
      .expect(200)

    expect(response.body.success).to.equal(true)
  })

  it('should resolve on valid verification for `share` event on twitter', async () => {
    // Create a dummy attestation
    await Attestation.create({
      method: AttestationTypes.TWITTER,
      ethAddress,
      value: '12345',
      signature: '0x0',
      remoteUpAddress: '192.168.1.1',
      profileUrl: '/',
      username: 'OriginProtocol'
    })

    // Push a fake event to redis
    client.set(
      `twitter/share/12345`,
      JSON.stringify({ text: 'Hello World' }),
      'EX',
      60
    )

    const response = await request(app)
      .post('/api/promotions/verify')
      .send({
        type: 'SHARE',
        socialNetwork: 'TWITTER',
        identity: ethAddress,
        identityProxy: ethAddress,
        content: 'Hello World'
      })
      .expect(200)

    expect(response.body.success).to.equal(true)
  })

  it('should fail on missing attestation', async () => {
    const response = await request(app)
      .post('/api/promotions/verify')
      .send({
        type: 'SHARE',
        socialNetwork: 'TWITTER',
        identityProxy: ethAddress,
        identity: ethAddress
      })
      .expect(400)

    expect(response.body.success).to.equal(false)
    expect(response.body.errors[0]).to.equal('Attestation missing')
  })

  it('should fail on poll timeout', async () => {
    // Create a dummy attestation
    await Attestation.create({
      method: AttestationTypes.TWITTER,
      ethAddress: ethAddress,
      value: '45678',
      signature: '0x0',
      remoteUpAddress: '192.168.1.1',
      profileUrl: '/',
      username: 'OriginProtocol'
    })

    // Push a fake event to redis with different content that expected
    client.set(
      `twitter/share/45678`,
      JSON.stringify({ text: 'Not My Content' }),
      'EX',
      60
    )

    const response = await request(app)
      .post('/api/promotions/verify')
      .send({
        type: 'SHARE',
        socialNetwork: 'TWITTER',
        identity: ethAddress,
        identityProxy: ethAddress,
        content: 'My Content'
      })
      .expect(200)

    expect(response.body.success).to.equal(false)
    expect(response.body.errors[0]).to.equal(`Verification timed out`)
  })

  it('should fail on missing identity', async () => {
    const response = await request(app)
      .post('/api/promotions/verify')
      .send({
        type: 'FOLLOW',
        socialNetwork: 'TWITTER',
        identity: '',
        identityProxy: ''
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal(
      'Field identity must not be empty.'
    )
  })

  it('should fail on unknown social network', async () => {
    const response = await request(app)
      .post('/api/promotions/verify')
      .send({
        type: 'FOLLOW',
        socialNetwork: 'NOT_A_SOCIAL_NETWORK',
        identity: ethAddress,
        identityProxy: ethAddress
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Unsupported social network')
  })

  it('should fail on unknown event', async () => {
    const response = await request(app)
      .post('/api/promotions/verify')
      .send({
        type: 'UNFOLLOW',
        socialNetwork: 'TWITTER',
        identity: ethAddress,
        identityProxy: ethAddress
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Unknown event type')
  })
})
