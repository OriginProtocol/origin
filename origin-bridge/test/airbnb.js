const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

const app = require('../src/app')

describe('airbnb attestations', () => {
  it('should generate an verification code', () => {
    response = request(app)
      .get('/airbnb/generate-code')
      .query({
        ethAddress: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        userId: 123456
      })
      .expect(200)
      .then(response => {
        expect(response.body.code).equal(
          'topple wedding catalog topple catalog above february'
        )
      })
  })

  it('should error on generate code with incorrect user id format', () => {})

  it('should generate attestation on valid verification code', () => {})

  it('should error on missing verification code', () => {})

  it('should error on incorrect verification code', () => {})

  it('should error on missing verification code', () => {})

  it('should error on incorrect user id format', () => {})

  it('should error on non existing airbnb user', () => {})

  it('should return a message on internal server error', () => {})
})
