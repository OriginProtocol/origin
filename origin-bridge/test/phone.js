const chai = require('chai')
const expect = chai.expect
const nock = require('nock')
const request = require('supertest')
const app = require('../src/app')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

describe('phone attestations', () => {
  beforeEach(() => {
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

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(400)
      .then(response => {
        expect(response.body.errors[0]).to.equal(
          'Invalid phone verification method: magic'
        )
      })
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
        'error_code': '60033'
      })

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(400)
      .then(response => {
        expect(response.body.errors.phone).to.equal('Phone number is invalid.')
      })
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
        'error_code': '60083'
      })

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(400)
      .then(response => {
        expect(response.body.errors.phone).to.equal('Cannot send SMS to landline.')
      })
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

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(500)
      .then(response => {
        expect(response.body.errors[0]).to.equal('Could not send phone verification code, please try again later.')
      })
  })

  it('should generate attestation on valid verification code', () => {})

  it('should error on missing verification code', () => {})

  it('should error on incorrect verification code', () => {})

  it('should error on expired verification code', () => {})

  it('should use en locale for sms in india', async () => {
    const params = {
      country_calling_code: '91',
      phone_number: '12341234',
      method: 'sms'
    }

    let parsedBody = null
    const scope = nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start', body => {
        parsedBody = body
        return body
      })
      .reply(200)

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(200)
      .then(response => {
        expect(parsedBody.locale).to.equal('en')
      })
  })

  it('should allow locale override for sms in india', async () => {
    const params = {
      country_calling_code: '91',
      phone_number: '12341234',
      method: 'sms',
      locale: 'de'
    }

    let parsedBody = null
    const scope = nock('https://api.authy.com')
      .post('/protected/json/phones/verification/start', body => {
        parsedBody = body
        return body
      })
      .reply(200)

    await request(app)
      .post('/phone/generate-code')
      .send(params)
      .expect(200)
      .then(response => {
        expect(parsedBody.locale).to.equal('de')
      })
  })
})
