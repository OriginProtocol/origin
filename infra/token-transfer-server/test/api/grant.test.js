const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const express = require('express')

const { User, Grant, sequelize } = require('../../src/models')

process.env.SENDGRID_FROM_EMAIL = 'test@test.com'
process.env.SENDGRID_API_KEY = 'test'
process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const app = require('../../src/app')

describe('Grant HTTP API', () => {
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

    this.grants = [
      await Grant.create({
        userId: this.user.id,
        start: new Date('2018-10-10'),
        end: new Date('2021-10-10'),
        cliff: new Date('2019-10-10'),
        amount: 11125000,
        interval: 'days'
      }),
      await Grant.create({
        userId: this.user.id,
        start: new Date('2020-05-05'),
        end: new Date('2024-05-05'),
        cliff: new Date('2021-05-05'),
        amount: 10000000,
        interval: 'days'
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

  it('should return the grants', async () => {
    const response = await request(this.mockApp)
      .get('/api/grants')
      .expect(200)

    expect(response.body.length).to.equal(2)
  })

  it('should not return grants for other users', async () => {
    await Grant.create({
      userId: this.user2.id,
      start: new Date('2019-10-10'),
      end: new Date('2022-10-10'),
      cliff: new Date('2020-10-10'),
      amount: 11125000,
      interval: 'days'
    })

    const response = await request(this.mockApp)
      .get('/api/grants')
      .expect(200)

    expect(response.body.length).to.equal(2)
  })
})
