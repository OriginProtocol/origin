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

describe('Login HTTP API', () => {
  beforeEach(async () => {
    this.user = await User.create({
      id: 1,
      email: 'user@originprotocol.com',
      otpKey: '123',
      otpVerified: true
    })

    this.user2 = await User.create({
      id: 2,
      email: 'user2@originprotocol.com',
      otpKey: '123'
    })

    this.mockApp = express()
    this.mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: 1
        },
        twoFA: 'totp'
      }
      next()
    })
    this.mockApp.use(app)
  })

  afterEach(() => {
    // Cleanup
    User.destroy({
      where: {},
    })
  })

  it('should not allow reset of totp if verified', async () => {
    await request(this.mockApp)
      .post('/api/setup_totp')
      .expect(403)
  })
})
