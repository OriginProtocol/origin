const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const app = require('../src/app')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

describe('facebook attestations', () => {
  it('should generate a correct auth url', done => {
    response = request(app)
      .get('/facebook/auth-url')
      .expect(200)
      .end((err, response) => {
        expect(response.body.url).equal(
          'https://www.facebook.com/v2.12/dialog/oauth?' +
            'client_id=facebook-client-id' +
            '&redirect_uri=https://testhost.com/redirects/facebook/'
        )
        if (err) return done(err)
        done()
      })
  })

  it('should generate attestation on valid verification code', () => {})

  it('should error on incorrect verification code', () => {})

  it('should error on missing verification code', () => {})
})
