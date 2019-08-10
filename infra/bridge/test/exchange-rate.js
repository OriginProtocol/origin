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
          usd: { name: 'US Dollar', unit: '$', value: 11874.946, type: 'fiat' },
          eth: { name: 'Ether', unit: 'ETH', value: 56.755, type: 'crypto' }
        }
      })

    let response = await request(app)
      .get('/utils/exchange-rate?market=ETH-USD')
      .expect(200)
    expect(response.status).to.equal(200)
    // formula for the rate is
    // 1 / ((btc.value / usd.value) * symbol.value)
    expect(response.body.price).to.equal('209.2317152673773')

    response = await request(app)
      .get('/utils/exchange-rate?market=DAI-USD')
      .expect(200)

    expect(response.status).to.equal(200)
    // DAI currently set to '1' in exchange-rate.js
    expect(response.body.price).to.equal('1')
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

  it('should fetch ETH/DAI exchange rates relative to all supported currencies', async () => {
    const rates = {
      btc: { name: 'Bitcoin', unit: 'BTC', value: 1.0, type: 'crypto' },
      usd: { name: 'US Dollar', unit: '$', value: 11874.946, type: 'fiat' },
      eth: { name: 'Ether', unit: 'ETH', value: 56.755, type: 'crypto' },
      cny: {
        name: 'Chinese Yuan',
        unit: '¥',
        value: 83722.471,
        type: 'fiat'
      },
      gbp: {
        name: 'British Pound Sterling',
        unit: '£',
        value: 9856.02,
        type: 'fiat'
      },
      krw: {
        name: 'South Korean Won',
        unit: '₩',
        value: 14397152.593,
        type: 'fiat'
      },
      sgd: {
        name: 'Singapore Dollar',
        unit: 'S$',
        value: 16424.143,
        type: 'fiat'
      },
      jpy: {
        name: 'Japanese Yen',
        unit: '¥',
        value: 1252282.568,
        type: 'fiat'
      },
      eur: { name: 'Euro', unit: '€', value: 10581.324, type: 'fiat' }
    }

    const exchangeFrom = ['ETH', 'DAI']
    const exchangeTo = ['CNY', 'JPY', 'GBP', 'USD', 'EUR', 'KRW', 'SGD']
    const promises = []
    const markets = []

    exchangeTo.forEach(t =>
      exchangeFrom.forEach(f => {
        nock('https://api.coingecko.com')
          .get('/api/v3/exchange_rates')
          .reply(200, { rates })
        const market = `${f}-${t}`
        promises.push(
          request(app)
            .get(`/utils/exchange-rate?market=${market}`)
            .expect(200)
        )
        markets.push(`${market}`)
      })
    )

    const responses = await Promise.all(promises)
    responses.forEach((r, i) => {
      const symbols = markets[i].toLowerCase().split('-')
      let exchangeFromSymbol = symbols[0]
      let exchangeToSymbol = symbols[1]
      // setting DAI to value of USD because coingecko doesn't support it
      // and this is a stable coin pegged to USD value. Variation should
      // be so small its irrelevant.
      exchangeFromSymbol === 'dai' ? (exchangeFromSymbol = 'usd') : null
      exchangeToSymbol === 'dai' ? (exchangeToSymbol = 'usd') : null
      const rate = (
        1 /
        ((1 / rates[exchangeToSymbol].value) * rates[exchangeFromSymbol].value)
      ).toString()

      expect(r.status).to.equal(200)
      expect(r.body.price).to.equal(rate)
    })
  })
})
