const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const express = require('express')

const { User, Grant } = require('../../src/models')

process.env.SENDGRID_FROM_EMAIL = 'test@test.com'
process.env.SENDGRID_API_KEY = 'test'
process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const app = require('../../src/app')

describe('Grant HTTP API', () => {
  beforeEach(async () => {
    this.user = await User.create({
      id: 1,
      email: 'user@originprotocol.com',
      otpKey: '123',
      otpVerified: true
    })

    this.grants = [await Grant.create({})]

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
      where: {}
    })

    Grant.destroy({
      where: {}
    })
  })

  it('should return the grants', async () => {})

  it('should not return grants for other users', async () => {})
})
