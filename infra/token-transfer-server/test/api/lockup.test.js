const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const express = require('express')
const moment = require('moment')
const sinon = require('sinon')
const totp = require('notp').totp
const base32 = require('thirty-two')
const crypto = require('crypto')
const sendgridMail = require('@sendgrid/mail')
const jwt = require('jsonwebtoken')

const { Grant, Lockup, Transfer, User, sequelize } = require('../../src/models')
const { encrypt } = require('../../src/lib/crypto')
const transferController = require('../../src/controllers/transfer')
const enums = require('../../src/enums')

process.env.ENCRYPTION_SECRET = 'test'
process.env.LOCKUP_BONUS_RATE = 10
process.env.LOCKUP_DURATION = 12

const { encryptionSecret } = require('../../src/config')

const app = require('../../src/app')

const toAddress = '0xf17f52151ebef6c7334fad080c5704d77216b732'

describe('Lockup HTTP API', () => {
  beforeEach(async () => {
    // Wipe database before each test
    expect(process.env.NODE_ENV).to.equal('test')
    await sequelize.sync({ force: true })

    // Generate an OTP key
    this.otpKey = crypto.randomBytes(10).toString('hex')
    this.encodedKey = base32.encode(this.otpKey).toString()
    const encryptedKey = encrypt(this.otpKey)

    this.user = await User.create({
      email: 'user@originprotocol.com',
      name: 'User 1',
      otpKey: encryptedKey,
      otpVerified: true
    })

    this.lockups = [
      await Lockup.create({
        userId: this.user.id,
        start: moment().add(1, 'years'),
        end: moment().add(2, 'years'),
        amount: 1000,
        confirmed: true
      }),
      await Lockup.create({
        userId: this.user.id,
        start: moment().add(2, 'years'),
        end: moment().add(3, 'years'),
        amount: 10000,
        confirmed: true
      })
    ]

    this.grants = [
      await Grant.create({
        userId: this.user.id,
        start: moment().subtract(4, 'years'),
        end: moment(),
        cliff: moment().subtract(3, 'years'),
        amount: 100000,
        interval: 'days'
      }),
      await Grant.create({
        userId: this.user.id,
        start: moment().add(1, 'years'),
        end: moment().add(4, 'years'),
        cliff: moment().add(1, 'years'),
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

  it('should return the lockups', async () => {
    const response = await request(this.mockApp)
      .get('/api/lockups')
      .expect(200)

    expect(response.body.length).to.equal(2)
  })

  it('should add a lockup', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')

    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 1000,
        code: totp.gen(this.otpKey)
      })
      .expect(201)

    expect(
      (await request(this.mockApp).get('/api/lockups')).body.length
    ).to.equal(3)

    // Check an email was sent with the confirmation token
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should add a lockup if enough tokens with matured lockups', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')

    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100001,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    await Lockup.create({
      userId: this.user.id,
      amount: 1000,
      start: moment()
        .subtract(1, 'years')
        .subtract(1, 'days'),
      end: moment().subtract(1, 'years'),
      code: totp.gen(this.otpKey),
      bonusRate: 10.0,
      confirmed: true
    })

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100001,
        code: totp.gen(this.otpKey)
      })
      .expect(201)

    // Check an email was sent with the confirmation token
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should not add a lockup if not enough tokens (vested)', async () => {
    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 1000001,
        code: totp.gen(this.otpKey)
      })
      .expect(422)
  })

  it('should not add a lockup if not enough tokens (vested minus transfer enqueued)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getUnlockDate', unlockFake)

    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 999999,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)
  })

  it('should not add a lockup if not enough tokens (vested minus transfer paused)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getUnlockDate', unlockFake)

    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Paused,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 999999,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)
  })

  it('should not add a lockup if not enough tokens (vested minus transfer waiting)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getUnlockDate', unlockFake)

    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingConfirmation,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 999999,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)
  })

  it('should not add a lockup if not enough tokens (vested minus transfer succcess)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getUnlockDate', unlockFake)

    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Success,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 999999,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)
  })

  it('should not add a lockup if not enough tokens (vested minus locked)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getUnlockDate', unlockFake)

    await Lockup.create({
      userId: this.user.id,
      amount: 2,
      start: moment().subtract(1, 'days'),
      end: moment()
        .add(1, 'years')
        .add(1, 'days'),
      bonusRate: 10.0
    })

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 999999,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)
  })

  it('should not add lockups simultaneously if not enough tokens', async () => {
    const results = await Promise.all([
      request(this.mockApp)
        .post('/api/lockups')
        .send({
          amount: 1000000,
          code: totp.gen(this.otpKey)
        }),
      request(this.mockApp)
        .post('/api/lockups')
        .send({
          amount: 1,
          code: totp.gen(this.otpKey)
        })
    ])

    expect(results.some(result => result.status === 422)).to.equal(true)

    // 1 lockup should be created because 1 failed
    expect(
      (await request(this.mockApp).get('/api/lockups')).body.length
    ).to.equal(3)
  })

  it('should not add lockups with below 0 amount', async () => {
    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: -10,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/greater/)
  })

  it('should not confirm a lockup with invalid token', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      amount: 1000000
    })

    const token = jwt.sign(
      {
        lockupId: 'invalid'
      },
      encryptionSecret,
      { expiresIn: '5m' }
    )

    await request(this.mockApp)
      .post(`/api/lockups/${transfer.id}`)
      .send({ token })
      .expect(400)
  })
})
