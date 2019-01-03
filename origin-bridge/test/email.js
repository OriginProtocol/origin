const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

describe('email attestations', () => {
  it('should send an verification code', () => {
  })

  it('should return a message on sendgrid error', () => {
  })

  it('should generate attestation on valid verification code', () => {
  })

  it('should error on expired verification code', () => {
  })

  it('should error on incorrect verification code', () => {
  })

  it('should error on missing verification code', () => {
  })

  it('should error on incorrect email format', () => {
  })
})
