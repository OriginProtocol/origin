const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const app = require('../src/app')
const { getAbsoluteUrl } = require('../src/utils')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

describe('facebook attestations', () => {
  it('should generate a correct auth url', async () => {
    process.env.FACEBOOK_CLIENT_ID = 'facebook-client-id'
    const redirectUrl = getAbsoluteUrl('/redirects/facebook/')

    const response = await request(app)
      .get('/facebook/auth-url')
      .expect(200)

    expect(response.body.url).equal(
      `https://www.facebook.com/v3.2/dialog/oauth?client_id=${
        process.env.FACEBOOK_CLIENT_ID
      }&redirect_uri=${redirectUrl}`
    )
  })

  it('should generate attestation on valid verification code', () => {})

  it('should error on incorrect verification code', () => {})

  it('should error on missing verification code', () => {})
})
