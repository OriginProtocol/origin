'use strict'

const chai = require('chai')
const expect = chai.expect
const nock = require('nock')
const request = require('supertest')

const Attestation = require('@origin/identity/src/models').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'

describe('website attestations', () => {
  beforeEach(async () => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY =
      '0x55b70794dc08958c9d2c657d3446a047f4aad20cca223fe34b6092de802dc668'

    await Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should generate a verification code', async () => {
    const response = await request(app)
      .get('/api/attestations/website/generate-code')
      .query({
        identity: ethAddress,
        website: 'https://random.domainname/'
      })
      .expect(200)

    expect(response.body.code).equal(
      '3bfc42b98aa4d838e3706f005f397f4361927d6190996101768990ddc969ba6c0005dd2e620cd4aad00d36b01a36f1431d38d2f33514fce2524fb15658f7bb4e1b'
    )
  })

  it('should generate attestation on valid verification code', async () => {
    nock('https://random.domainname')
      .get(`/${ethAddress}.html`)
      .once()
      .reply(
        200,
        '3bfc42b98aa4d838e3706f005f397f4361927d6190996101768990ddc969ba6c0005dd2e620cd4aad00d36b01a36f1431d38d2f33514fce2524fb15658f7bb4e1b'
      )

    const response = await request(app)
      .post('/api/attestations/website/verify')
      .send({
        identity: ethAddress,
        website: 'https://random.domainname/'
      })

    expect(response.body.schemaId).to.equal(
      'https://schema.originprotocol.com/attestation_1.0.0.json'
    )
    expect(response.body.data.issuer.name).to.equal('Origin Protocol')
    expect(response.body.data.issuer.url).to.equal(
      'https://www.originprotocol.com'
    )
    expect(
      response.body.data.attestation.verificationMethod.pubAuditableUrl
    ).to.deep.equal({
      proofUrl: `https://random.domainname/${ethAddress}.html`
    })
    expect(response.body.data.attestation.domain.verified).to.equal(true)

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.WEBSITE)
    expect(results[0].value).to.equal('https://random.domainname')
  })

  it('should throw error on incorrect verification code', async () => {
    nock('https://random.domainname')
      .get(`/${ethAddress}.html`)
      .once()
      .reply(200, 'Invalid code')

    const response = await request(app)
      .post('/api/attestations/website/verify')
      .send({
        identity: ethAddress,
        website: 'https://random.domainname/'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal(
      'Origin verification code is incorrect.'
    )
  })

  it('should throw error on internal server error', async () => {
    nock('https://random.domainname')
      .get(`/${ethAddress}.html`)
      .once()
      .reply(500)

    const response = await request(app)
      .post('/api/attestations/website/verify')
      .send({
        identity: ethAddress,
        website: 'https://random.domainname/'
      })
      .expect(500)

    expect(response.body.errors[0]).to.equal(
      `Could not fetch website at 'https://random.domainname'.`
    )
  })

  it('should throw error if file not found', async () => {
    nock('https://random.domainname')
      .get(`/${ethAddress}.html`)
      .once()
      .reply(404)

    const response = await request(app)
      .post('/api/attestations/website/verify')
      .send({
        identity: ethAddress,
        website: 'https://random.domainname/'
      })
      .expect(400)

    expect(response.body.errors[0]).to.equal(
      `File "${ethAddress}.html" was not found in remote host.`
    )
  })

  it('should throw error on malformed URL', async () => {
    const response = await request(app)
      .post('/api/attestations/website/verify')
      .send({
        identity: ethAddress,
        website: 'https//random...domainname/'
      })
    // .expect(400)

    expect(response.body.errors[0]).to.equal(
      'Field `website` must be a valid URL'
    )
  })
})
