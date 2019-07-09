'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const redis = require('redis')
const nock = require('nock')

const Identity = require('@origin/identity/src/models').Identity
const app = require('../src/app')

const baseIdentity = {
  ethAddress: '0x000a'
}

const client = redis.createClient()

describe('identity exists', () => {
  beforeEach(() => {
    Identity.destroy({
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

describe('exchange rate poller', () => {
  beforeEach(() => {
    client.del('ETH-USD_price')
    process.env.FALLBACK_EXCHANGE_RATE_XXX_USD = '12345.6789'
  })

  it('should return exchange rate from redis', async () => {
    await client.set('ETH-USD_price', '234')
    const response = await request(app)
      .get('/utils/exchange-rate?market=ETH-USD')
      .expect(200)

    expect(response.status).to.equal(200)
    expect(response.body.price).to.equal('234')
  })

  it('should fetch exchange rate from API if not cached', async () => {
    nock('https://api.cryptonator.com')
      .get('/api/ticker/YYY-USD')
      .reply(200, { success: true, ticker: { price: '678.9' } })

    const response = await request(app)
      .get('/utils/exchange-rate?market=YYY-USD')
      .expect(200)

    expect(response.status).to.equal(200)
    expect(response.body.price).to.equal('678.9')
  })

  it('should return default exchange rate if not cached and API is down', async () => {
    nock('https://api.cryptonator.com')
      .get('/api/ticker/XXX-USD')
      .reply(200, { success: false, error: `Invalid pair` })

    const response = await request(app)
      .get('/utils/exchange-rate?market=XXX-USD')
      .expect(200)

    expect(response.status).to.equal(200)
    expect(response.body.price).to.equal('12345.6789')
  })
})
