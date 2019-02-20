const chai = require('chai')
const expect = chai.expect
const session = require('supertest-session')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

const app = require('../src/app')

describe('email attestations', () => {
  let testSession

  beforeEach(() => {
    testSession = session(app)
  })

  it('should generate a verification code', () => {
    response = testSession
      .post('/email/generate-code')
      .send({ email: 'origin@protocol.foo' })
      .expect(200)
      .then(response => {
        expect(typeof response.body.code).equal('number')
        expect(String(response.body.code).length).equal(6)
      })
  })

  it('should return a message on sendgrid error', () => {})

  it('should generate attestation on valid verification code', () => {})

  it('should error on expired verification code', () => {})

  it('should error on incorrect verification code', () => {})

  it('should error on missing verification code', () => {})

  it('should error on incorrect email format', () => {})
})
