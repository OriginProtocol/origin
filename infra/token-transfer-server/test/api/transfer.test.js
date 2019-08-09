const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const express = require('express')

const { User, Transfer } = require('../../src/models')
const transfers = require('../../src/constants/events')

process.env.SENDGRID_FROM_EMAIL = 'test@test.com'
process.env.SENDGRID_API_KEY = 'test'
process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const app = require('../../src/app')

describe('Grant HTTP API', () => {
  beforeEach(async () => {
    this.user = await User.create({
      email: 'user@originprotocol.com',
      otpKey: '123',
      otpVerified: true
    })

    this.user2 = await User.create({
      email: 'user2@originprotocol.com'
    })

    this.grants = [
    ]

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
    Transfer.destroy({
      where: {}
    })

    // Cleanup
    User.destroy({
      where: {}
    })
  })

  it('should return the transfers', async () => {
  })

  it('should not return transfers for other users', async () => {
  })
})

