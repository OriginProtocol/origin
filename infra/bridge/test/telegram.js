'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const Attestation = require('../src/models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'

describe('telegram attestation', () => {
  beforeEach(async () => {
    process.env.TELEGRAM_BOT_TOKEN = '12345.6789'

    await Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate attestation on valid data', async () => {
    const response = await request(app)
      .post('/api/attestations/telegram/verify')
      .send({
        identity: ethAddress,
        hash: '7cc77e64216db0c62395f57e88e4153edfb801a2cd9279c1126a2a5a8d3b588c',
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
    expect(response.body.data.attestation.site.siteName).to.equal('telegram.com')
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

  it('should fail on invalid hash', async () => {
    const response = await request(app)
      .post('/api/attestations/telegram/verify')
      .send({
        identity: ethAddress,
        hash: '7cc77e64216db0c62395f57e88e4153edfb801a2cd9279c1126a2a5a8d3b588d',
        id: '12345'
      })
      .expect(400)
    
    expect(response.body.errors.length).to.equal(1)
    expect(response.body.errors[0]).to.equal('Failed to create an attestation')
  })
})
