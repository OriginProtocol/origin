const chai = require('chai')
const expect = chai.expect
const session = require('supertest-session')
const sinon = require('sinon')
const sendgridMail = require('@sendgrid/mail')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

const app = require('../src/app')

describe('email attestations', () => {
  let testSession

  beforeEach(() => {
    testSession = session(app)
  })

  it('should generate a verification code', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')

    await testSession
      .post('/email/generate-code')
      .send({ email: 'origin@protocol.foo' })
      .expect(200)

    expect(sendStub.called).to.be.true

    sendStub.restore()
  })

  it('should return a message on sendgrid error', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send').throws()

    const response = await testSession
      .post('/email/generate-code')
      .send({ email: 'origin@protocol.foo' })
      .expect(500)

    expect(response.body.errors[0]).to.equal(
      'Could not send email verification code, please try again shortly'
    )

    sendStub.restore()
  })

  it('should generate attestation on valid verification code', () => {})

  it('should error on expired verification code', () => {})

  it('should error on incorrect verification code', () => {})

  it('should error on missing verification code', () => {})

  it('should error on incorrect email format', () => {})
})
