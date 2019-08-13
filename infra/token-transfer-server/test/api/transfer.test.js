const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const express = require('express')

const { Grant, Transfer, User } = require('../../src/models')
const TransferStatuses = require('../../src/enums')

process.env.SENDGRID_FROM_EMAIL = 'test@test.com'
process.env.SENDGRID_API_KEY = 'test'
process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const app = require('../../src/app')

const fromAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
const toAddress = '0xf17f52151ebef6c7334fad080c5704d77216b732'

describe('Transfer HTTP API', () => {
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
      await Grant.create({
        // Fully vested grant
        userId: this.user.id,
        start: new Date('2014-10-10'),
        end: new Date('2028-10-10'),
        cliff: new Date('2015-10-10'),
        amount: 1000000,
        interval: 'days'
      }),
      // Fully unvested grant
      await Grant.create({
        userId: this.user.id,
        start: new Date('2030-05-05'),
        end: new Date('2034-05-05'),
        cliff: new Date('2031-05-05'),
        amount: 10000000,
        interval: 'days'
      }),
      // Grant for second user
      await Grant.create({
        userId: this.user2.id,
        start: new Date('2019-04-04'),
        end: new Date('2023-04-04'),
        cliff: new Date('2020-04-04'),
        amount: 20000,
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

  afterEach(() => {
    Transfer.destroy({
      where: {}
    })

    Grant.destroy({
      where: {}
    })

    // Cleanup
    User.destroy({
      where: {}
    })
  })

  it('should return the transfers', async () => {
    await Transfer.create({
      grantId: this.grants[0].id,
      status: TransferStatuses.Success,
      fromAddress,
      toAddress,
      amount: 10000,
      currency: 'OGN'
    }),
      await Transfer.create({
        grantId: this.grants[0].id,
        status: TransferStatuses.Success,
        fromAddress,
        toAddress,
        amount: 100000,
        currency: 'OGN'
      })

    const response = await request(this.mockApp).get('/api/transfers')

    expect(response.body.length).to.equal(2)
  })

  it('should not return transfers for other users', async () => {
    await Transfer.create({
      grantId: this.grants[2].id,
      status: TransferStatuses.Success,
      fromAddress,
      toAddress,
      amount: 10000,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .get('/api/grants')
      .expect(200)

    expect(response.body.length).to.equal(2)
  })

  it('should enqueue a transfer', async () => {})

  it('should not enqueue a transfer if not enough tokens (vested)', async () => {})

  it('should not enqueue a transfer if not enough tokens (vested minus enqueued)', async () => {})

  it('should not enqueue a trasnfer if not enough tokens (vested minus paused)', async () => {})

  it('should not enqueue a trasnfer if not enough tokens (vested minus waiting)', async () => {})

  it('should not enqueue a trasnfer if not enough tokens (vested minus success)', async () => {})

  it('should not enqueue a trasnfer if not enough tokens (multiple states)', async () => {})
})
