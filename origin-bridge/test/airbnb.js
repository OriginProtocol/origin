const chai = require('chai')
const expect = chai.expect
const nock = require('nock')
const request = require('supertest')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

const app = require('../src/app')

describe('airbnb attestations', () => {
  it('should generate a verification code', async () => {
    const response = await request(app)
      .get('/airbnb/generate-code')
      .query({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 123456
      })
      .expect(200)

    expect(response.body.code).equal(
      'topple wedding catalog topple catalog above february'
    )
  })

  it('should error on generate code with incorrect user id format', async () => {
    const response = await request(app)
      .get('/airbnb/generate-code')
      .query({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 'ab123456'
      })
      .expect(400)
  })

  it('should generate attestation on valid verification code', async () => {})

  it('should error on invalid airbnb user id format', async () => {
    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 'ab123456'
      })
      .expect(400)

    expect(response.body.errors.airbnbUserId).to.equal('Invalid value')
  })

  it('should error on incorrect verification code', async () => {
    nock('https://www.airbnb.com')
      .get('/users/show/123456')
      .reply(200, '<html></html>')

    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 123456
      })

    expect(response.body.errors[0]).to.equal(
      'Origin verification code "topple wedding catalog topple catalog above february" was not found in Airbnb profile.'
    )
  })

  it('should error on non existing airbnb user', async () => {
    nock('https://www.airbnb.com')
      .get('/users/show/123456')
      .reply(404)

    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 123456
      })

    expect(response.body.errors.airbnbUserId).to.equal('Airbnb user not found.')
  })

  it('should return a message on internal server error', async () => {
    nock('https://www.airbnb.com')
      .get('/users/show/123456')
      .reply(500)

    const response = await request(app)
      .post('/airbnb/verify')
      .send({
        identity: '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId: 123456
      })

    expect(response.body.errors[0]).to.equal('Could not fetch Airbnb profile.')
  })
})
