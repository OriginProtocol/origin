'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const redis = require('redis')
const nock = require('nock')

const app = require('../src/app')

const client = redis.createClient()

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
