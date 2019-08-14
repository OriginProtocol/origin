'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const Web3 = require('web3')
const redis = require('redis')

const Attestation = require('../src/models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'
const client = redis.createClient()

describe('telegram attestation', () => {
  beforeEach(async () => {
    process.env.TELEGRAM_BOT_TOKEN = '12345.6789'

    // Clear out redis-mock
    await new Promise(resolve => client.flushall(resolve))

    await Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generrate a code and a seed', async () => {
    const response = await request(app)
      .get('/api/attestations/telegram/generate-code?identity=' + ethAddress)
      .expect(200)

    expect(response.body).not.undefined.and.not.null

    const seed = await new Promise(resolve => client.get(`telegram/attestation/seed/${ethAddress}`, (err, data) => resolve(data)))

    expect(seed).not.undefined.and.not.null
  })

  it('should generate attestation on valid data', async () => {
    const code = 'weddingcatalogtopplecatalogabovefebruary'
    const eventKey = Web3.utils.sha3(code)

    await new Promise(resolve => client.set(`telegram/attestation/seed/${ethAddress}`, '123456', 'EX', 60, () => resolve()))
    await new Promise(resolve => client.set(`telegram/attestation/event/${eventKey}`, JSON.stringify({
      message: {
        from: {
          id: '12345'
        }
      },
      payload: 'weddingcatalogtopplecatalogabovefebruary'
    }), 'EX', 60, () => resolve()))

    const response = await request(app)
      .post('/api/attestations/telegram/verify')
      .send({
        identity: ethAddress,
        code:
          'weddingcatalogtopplecatalogabovefebruary',
        id: '12345'
      })
      .expect(200)

    expect(response.body.schemaId).to.equal(
      'https://schema.originprotocol.com/attestation_1.0.0.json'
    )
    expect(response.body.data.issuer.name).to.equal('Origin Protocol')
    expect(response.body.data.issuer.url).to.equal(
      'https://www.originprotocol.com'
    )
    expect(response.body.data.attestation.verificationMethod.oAuth).to.equal(
      true
    )
    expect(response.body.data.attestation.site.siteName).to.equal(
      'telegram.com'
    )
    expect(response.body.data.attestation.site.userId.raw).to.equal('12345')
    expect(response.body.data.attestation.site.username.raw).to.undefined
    expect(response.body.data.attestation.site.profileUrl.raw).to.null

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.TELEGRAM)
    expect(results[0].value).to.equal('12345')
    expect(results[0].username).to.null
    expect(results[0].profileUrl).to.null
  })

  it('should fail on invalid code', async () => {
    const code = 'weddingcatalogtopplecatalogabovefebruary'
    const eventKey = Web3.utils.sha3(code)

    await new Promise(resolve => client.set(`telegram/attestation/seed/${ethAddress}`, '123456', 'EX', 60, () => resolve()))
    await new Promise(resolve => client.set(`telegram/attestation/event/${eventKey}`, JSON.stringify({
      message: {
        from: {
          id: '12345'
        }
      },
      payload: 'weddingcatalogtopplecatalogabovefebruary234'
    }), 'EX', 60, () => resolve()))

    const response = await request(app)
      .post('/api/attestations/telegram/verify')
      .send({
        identity: ethAddress,
        code,
        id: '12345'
      })
      .expect(500)

    expect(response.body.errors[0]).to.equal(`Code verification failed`)
  })

  it('should fail on missing seed and event', async () => {
    const response = await request(app)
      .post('/api/attestations/telegram/verify')
      .send({
        identity: ethAddress,
        code:
          'weddingcatalogtopplecatalogabovefebruary',
        id: '12345'
      })
      .expect(500)

    expect(response.body.errors[0]).to.equal(`You haven\'t interacted with the verification bot yet.`)
  })
})
