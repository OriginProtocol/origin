const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

describe('phone attestations', () => {
  it('should generate a verification code', () => {})

  it('should error on generate code with incorrect number format', () => {})

  it('should error on generate code using sms on landline number', () => {})

  it('should return a message on twilio api error', () => {})

  it('should generate attestation on valid verification code', () => {})

  it('should error on missing verification code', () => {})

  it('should error on incorrect verification code', () => {})

  it('should error on expired verification code', () => {})

  it('should use en locale for sms in india', () => {})
})
