'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const redis = require('redis')

const app = require('../src/app')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'
const client = redis.createClient()

describe('telegram attestation', () => {
  beforeEach(async () => {
    // Clear out redis-mock
    await new Promise(resolve => client.flushall(resolve))
  })

  it('should generrate a code and have logged the IP', async () => {
    const response = await request(app)
      .post('/api/attestations/telegram/generate-code?identity=' + ethAddress)
      .expect(200)

    expect(response.body.code).to.equal(ethAddress)

    const data = await new Promise(resolve =>
      client.get(`telegram/attestation/${ethAddress}`, (err, data) =>
        resolve(data ? JSON.parse(data) : null)
      )
    )

    expect(data).not.undefined.and.not.null
    expect(data.ip).not.undefined.and.not.null
  })

  it('should return status on successful verification', async () => {
    await new Promise(resolve =>
      client.set(
        `telegram/attestation/${ethAddress}/status`,
        '{"verified": true, "attestation": "hello world"}',
        () => resolve()
      )
    )

    const response = await request(app)
      .get('/api/attestations/telegram/status?identity=' + ethAddress)
      .expect(200)

    expect(response.body.verified).to.equal(true)
    expect(response.body.attestation).to.equal('hello world')
  })

  it('should return status on pending verification', async () => {
    const response = await request(app)
      .get('/api/attestations/telegram/status?identity=' + ethAddress)
      .expect(200)

    expect(response.body.verified).to.equal(false)
  })

  it('should fail to generate code on missing identity param', async () => {
    const response = await request(app)
      .post('/api/attestations/telegram/generate-code')
      .expect(400)

    expect(response.body.errors[0]).to.equal('Field identity must not be empty.')
  })

  it('should fail to get status on missing identity param', async () => {
    const response = await request(app)
      .get('/api/attestations/telegram/status')
      .expect(400)

    expect(response.body.errors[0]).to.equal('Field identity must not be empty.')
  })
})
