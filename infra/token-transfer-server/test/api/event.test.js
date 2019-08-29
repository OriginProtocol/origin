const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const express = require('express')

const { User, Event, sequelize } = require('../../src/models')
const events = require('../../src/constants/events')

process.env.SENDGRID_FROM_EMAIL = 'test@test.com'
process.env.SENDGRID_API_KEY = 'test'
process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const app = require('../../src/app')

describe('Event HTTP API', () => {
  beforeEach(async () => {
    // Wipe database before each test
    expect(process.env.NODE_ENV).to.equal('test')
    await sequelize.sync({ force: true })

    this.user = await User.create({
      email: 'user@originprotocol.com',
      name: 'User 1',
      otpKey: '123',
      otpVerified: true
    })

    this.user2 = await User.create({
      email: 'user2@originprotocol.com',
      name: 'User 2'
    })

    this.events = [
      await Event.create({
        userId: this.user.id,
        action: events.LOGIN,
        data: {
          ip: '127.0.0.1',
          device: {
            browser: 'Test'
          },
          location: null
        }
      }),
      await Event.create({
        userId: this.user.id,
        action: events.LOGOUT,
        data: {
          ip: '127.0.0.1',
          device: {
            browser: 'Test'
          },
          location: null
        }
      })
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

  it('should return the events', async () => {
    const response = await request(this.mockApp)
      .get('/api/events')
      .expect(200)

    expect(response.body.length).to.equal(2)
  })

  it('should not return events for other users', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user2.id
        },
        twoFA: 'totp'
      }
      next()
    })
    mockApp.use(app)

    const response = await request(this.mockApp)
      .get('/api/events')
      .expect(200)

    expect(response.body.length).to.equal(2)
  })
})
