'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const redis = require('redis')
const nock = require('nock')

const app = require('../src/app')

const client = redis.createClient()

describe('exchange rate poller', () => {
  beforeEach(async () => {
    // Clear out redis-mock
    await new Promise(resolve => client.flushall(resolve))
  })

  it('should return fallback value if API is down not cached', async () => {
    nock('https://min-api.cryptocompare.com')
      .get(/data\/price.*$/)
      .reply(400, {})

    const response = await request(app)
      .get('/utils/exchange-rate?market=ETH-USD')
      .expect(200)

    expect(response.body.price).to.equal(0.005515)
  })

  it('should throw if no market specified', async () => {
    const response = await request(app)
      .get('/utils/exchange-rate')
      .expect(400)

    expect(response.body.errors[0]).to.equal('Field market is required')
  })

  it('should return exchange rates of all markets', async () => {
    nock('https://min-api.cryptocompare.com')
      .get(/data\/price.*$/)
      .reply(200, {
        ETH: 0.011,
        USD: 1,
        DAI: 1
      })

    const response = await request(app)
      .get('/utils/exchange-rates')
      .expect(200)

    expect(response.body).to.deep.include({
      ETH: 0.011,
      USD: 1,
      DAI: 1
    })
  })

  it('should return exchange rate from cache', async () => {
    const response = await request(app)
      .get('/utils/exchange-rate?market=ETH-USD')
      .expect(200)

    expect(response.body.price).to.equal(0.011)
  })
})
