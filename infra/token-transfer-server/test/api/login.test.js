// const chai = require('chai')
// const expect = chai.expect
const request = require('supertest')
const express = require('express')

const { User } = require('../../src/models')

process.env.SENDGRID_FROM_EMAIL = 'test@test.com'
process.env.SENDGRID_API_KEY = 'test'
process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const app = require('../../src/app')

describe('account api', () => {
  beforeEach(async () => {
    this.user = await User.create({
      id: 1,
      email: 'user@originprotocol.com',
      otpKey: '123',
      otpVerified: true
    })

    this.mockApp = express()
    this.mockApp.use((req, res, next) => {
      req.session = {
        user: this.user.get({ plain: true }),
        email: 'user@originprotocol.com',
        twoFA: 'totp'
      }
      next()
    })
    this.mockApp.use(app)

    // Cleanup
    User.destroy({
      where: {},
      truncate: true
    })
  })

  it('should not allow reset of totp if verified', async () => {
    await request(this.mockApp)
      .post('/api/setup_totp')
      .expect(403)
  })
})
