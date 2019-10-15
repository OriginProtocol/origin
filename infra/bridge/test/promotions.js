'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const redis = require('redis')
const Sequelize = require('sequelize')

const env = process.env.NODE_ENV || 'test'
const config = require(__dirname + '/../config/sequelize.js')[env]

const sequelize = new Sequelize(process.env[config.use_env_variable], config)
const app = require('../src/app')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'
const client = redis.createClient()

const insertGrowthEvent = async ({ ethAddress, customId, type, status }) => {
  await sequelize.query(
    'insert into growth_event(custom_id, type, status, eth_address, created_at, updated_at) values(:customId, :type, :status, :ethAddress, now(), now())',
    {
      replacements: {
        ethAddress,
        customId,
        type,
        status
      }
    }
  )
}

describe('promotion verifications', () => {
  beforeEach(async () => {
    // Clear out redis-mock
    await new Promise(resolve => client.flushall(resolve))

    await sequelize.query('DELETE from growth_event')
  })

  it('should return false if follow event is not verified', async () => {
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'FOLLOW',
        socialNetwork: 'TWITTER',
        identity: ethAddress
      })
      .expect(200)

    expect(response.body.success).to.equal(true)
    expect(response.body.verified).to.equal(false)
  })

  it('should return false if share event is not verified', async () => {
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'SHARE',
        socialNetwork: 'TWITTER',
        identity: ethAddress,
        content: 'hello world'
      })
      .expect(200)

    expect(response.body.success).to.equal(true)
    expect(response.body.verified).to.equal(false)
  })

  it('should return true if follow event is verified', async () => {
    await insertGrowthEvent({
      ethAddress,
      customId: null,
      type: 'FollowedOnTwitter',
      status: 'Logged'
    })
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'FOLLOW',
        socialNetwork: 'TWITTER',
        identity: ethAddress
      })
      .expect(200)

    expect(response.body.success).to.equal(true)
    expect(response.body.verified).to.equal(true)
  })

  it('should return true if share event is verified', async () => {
    await insertGrowthEvent({
      ethAddress,
      customId: '5eb63bbbe01eeed093cb22bb8f5acdc3',
      type: 'SharedOnTwitter',
      status: 'Logged'
    })
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'SHARE',
        socialNetwork: 'TWITTER',
        identity: ethAddress,
        content: 'hello world'
      })
      .expect(200)

    expect(response.body.success).to.equal(true)
    expect(response.body.verified).to.equal(true)
  })

  it('should return true if content hash is different', async () => {
    await insertGrowthEvent({
      ethAddress,
      customId: 'NotTheHash',
      type: 'SharedOnTwitter',
      status: 'Logged'
    })
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'SHARE',
        socialNetwork: 'TWITTER',
        identity: ethAddress,
        content: 'hello world'
      })
      .expect(200)

    expect(response.body.success).to.equal(true)
    expect(response.body.verified).to.equal(false)
  })

  it('should return false if share event is not verified', async () => {
    await insertGrowthEvent({
      ethAddress,
      customId: null,
      type: 'FollowedOnTwitter',
      status: 'Logged'
    })
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'SHARE',
        socialNetwork: 'TWITTER',
        identity: ethAddress,
        content: 'hello world'
      })
      .expect(200)

    expect(response.body.success).to.equal(true)
    expect(response.body.verified).to.equal(false)
  })

  it('should fail on missing identity', async () => {
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'FOLLOW',
        socialNetwork: 'TWITTER',
        identity: ''
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal(
      'Field identity must not be empty.'
    )
  })

  it('should fail on unknown social network', async () => {
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'FOLLOW',
        socialNetwork: 'NOT_A_SOCIAL_NETWORK',
        identity: ethAddress
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Unsupported social network')
  })

  it('should fail on unknown event', async () => {
    const response = await request(app)
      .get('/api/promotions/verify')
      .query({
        type: 'UNFOLLOW',
        socialNetwork: 'TWITTER',
        identity: ethAddress
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal('Unknown event type')
  })
})
