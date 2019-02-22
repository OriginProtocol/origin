const Logger = require('logplease')
Logger.setLogLevel('NONE')
const chai = require('chai')
const expect = chai.expect
const nock = require('nock')
const request = require('supertest')

const Attestation = require('../src/models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const app = require('../src/app')

describe('phone attestations', () => {
  beforeEach(() => {
    // Configure environment variables required for tests
    process.env.ATTESTATION_SIGNING_KEY = '0xc1912'
    process.env.TWILIO_VERIFY_API_KEY = '1234'
  })

  it('should generate a verification code', async () => {
    const params = {
      country_calling_code: '1',
      phone_number: '12341234',
      method: 'sms',
      locale: 'en'
    }

    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start')
      .reply(200)

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(200)
  })

  it('should error on generate code with invalid method', async () => {
    const params = {
      country_calling_code: '1',
      phone_number: '12341234',
      method: 'magic',
      locale: 'en'
    }

    const response = await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(400)

    expect(response.body.errors.method).to.equal(
      'Invalid phone verification method'
    )
  })

  it('should error on generate code with incorrect number format', async () => {
    const params = {
      country_calling_code: '1',
      phone_number: '12341234',
      method: 'sms'
    }

    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start')
      .reply(400, {
        error_code: '60033'
      })

    const response = await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(400)

    expect(response.body.errors.phone).to.equal('Phone number is invalid.')
  })

  it('should error on generate code using sms on landline number', async () => {
    const params = {
      country_calling_code: '1',
      phone_number: '12341234',
      method: 'sms'
    }

    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start')
      .reply(400, {
        error_code: '60083'
      })

    const response = await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(400)

    expect(response.body.errors.phone).to.equal('Cannot send SMS to landline.')
  })

  it('should return a message on twilio api error', async () => {
    const params = {
      country_calling_code: '1',
      phone_number: '12341234',
      method: 'sms'
    }

    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start')
      .reply(500)

    const response = await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(500)

    expect(response.body.errors[0]).to.equal(
      'Could not send phone verification code, please try again shortly.'
    )
  })

  it('should generate attestation on valid verification code', async () => {
    // Execute a generate code request first so the session gets populated with
    // phoneVerificationMethod
    const verifyParams = {
      country_calling_code: '1',
      phone_number: '12341234',
      method: 'sms',
      locale: 'en'
    }

    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start')
      .reply(200)

    let cookie
    await request(app)
      .post('/phone/generate-code')
      .send(verifyParams)
      .expect(200)
      .then(response => {
        // Save the cookie for use in the next request
        cookie = response.headers['set-cookie']
      })

    const ethAddress = '0x112234455C3a32FD11230C42E7Bccd4A84e02010'

    const checkParams = {
      eth_address: ethAddress,
      country_calling_code: '1',
      phone_number: '12341234',
      code: '123456'
    }

    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/check')
      .reply(200, {
        message: 'Verification code is correct',
        success: true
      })

    const response = await request(app)
      .post('/phone/verify')
      .set('Cookie', cookie)
      .send(checkParams)
      .expect(200)

    expect(response.body.schemaId).to.equal(
      'https://schema.originprotocol.com/attestation_1.0.0.json'
    )
    expect(response.body.data.issuer.name).to.equal('Origin Protocol')
    expect(response.body.data.issuer.url).to.equal(
      'https://www.originprotocol.com'
    )
    expect(response.body.data.attestation.verificationMethod.sms).to.equal(true)
    expect(response.body.data.attestation.phone.verified).to.equal(true)

    // Verify attestation was recorded in the database
    const results = await Attestation.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(ethAddress)
    expect(results[0].method).to.equal(AttestationTypes.PHONE)
    expect(results[0].value).to.equal('1 12341234')
  })

  it('should error on missing verification code', async () => {
    const params = {
      eth_address: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
      country_calling_code: '1',
      phone_numberr: '12341234'
    }

    const response = await request(app)
      .post('/phone/verify')
      .send(params)
      .expect(400)

    expect(response.body.errors.phone_number).to.equal('Invalid value')
  })

  it('should error on incorrect verification code', async () => {
    const params = {
      eth_address: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
      country_calling_code: '1',
      phone_number: '12341234',
      code: '5678'
    }

    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/check')
      .reply(400, {
        error_code: '60022'
      })

    const response = await request(app)
      .post('/phone/verify')
      .send(params)
      .expect(400)

    expect(response.body.errors.phone).to.equal(
      'Verification code is incorrect.'
    )
  })

  it('should error on expired verification code', async () => {
    const params = {
      eth_address: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
      country_calling_code: '1',
      phone_number: '12341234',
      code: '1234'
    }

    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/check')
      .reply(400, {
        error_code: '60023'
      })

    const response = await request(app)
      .post('/phone/verify')
      .send(params)
      .expect(400)

    expect(response.body.errors.phone).to.equal(
      'Verification code has expired.'
    )
  })

  it('should use en locale for sms in india', async () => {
    const params = {
      country_calling_code: '91',
      phone_number: '12341234',
      method: 'sms'
    }

    let parsedBody = null
    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start', body => {
        parsedBody = body
        return body
      })
      .reply(200)

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(200)

    expect(parsedBody.locale).to.equal('en')
  })

  it('should allow locale override for sms in india', async () => {
    const params = {
      country_calling_code: '91',
      phone_number: '12341234',
      method: 'sms',
      locale: 'de'
    }

    let parsedBody = null
    nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start', body => {
        parsedBody = body
        return body
      })
      .reply(200)

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(200)

    expect(parsedBody.locale).to.equal('de')
  })
})
