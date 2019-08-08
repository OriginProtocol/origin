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
      email: 'user@originprotocol.com',
      otpKey: '123',
      otpVerified: true
    })

    this.user2 = await User.create({
      email: 'user2@originprotocol.com',
      otpKey: '123'
    })

    this.mockApp = express()
    this.mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user.id
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
      where: {}
    })
  })

  it('should send an email token for a valid email', async () => {
  })

  it('should not send an email token for invalid email but should not error', async () => {
  })

  it('should verify a valid email token', async () => {
  })

  it('should allow setup of totp', async () => {
  })

  it('should not allow setup of totp if already verified', async () => {
    await request(this.mockApp)
      .post('/api/setup_totp')
      .expect(403)
  })

  it('should verify a valid totp', async () => {
  })

  it('should add a login event on a valid totp', async () => {
  })
})
