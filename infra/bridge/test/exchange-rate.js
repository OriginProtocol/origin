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
    nock('https://api.coingecko.com')
      .get('/api/v3/exchange_rates')
      .reply(200, {
        rates: {
          btc: { name: 'Bitcoin', unit: 'BTC', value: 1.0, type: 'crypto' },
          usd: { name: 'US Dollar', unit: '$', value: 11874.946, type: 'fiat' }
        }
      })

    const response = await request(app)
      .get('/utils/exchange-rate?market=BTC-USD')
      .expect(200)

    expect(response.status).to.equal(200)
    expect(response.body.price).to.equal('11874.946')
  })

  it('should return default exchange rate if not cached and API is down', async () => {
    nock('https://api.coingecko.com')
      .get('/api/v3/exchange_rates')
      .reply(200, { ok: false })

    const response = await request(app)
      .get('/utils/exchange-rate?market=ETH-USD')
      .expect(200)

    expect(response.status).to.equal(200)
    expect(response.body.price).to.equal('222.91')
  })
})
