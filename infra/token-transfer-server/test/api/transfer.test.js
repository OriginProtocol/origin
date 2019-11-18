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

const { Grant, Transfer, User, sequelize } = require('../../src/models')
const { encrypt } = require('../../src/lib/crypto')
const transferController = require('../../src/controllers/transfer')
const lockupController = require('../../src/controllers/lockup')
const enums = require('../../src/enums')

process.env.SENDGRID_FROM_EMAIL = 'test@test.com'
process.env.SENDGRID_API_KEY = 'test'
process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const { transferConfirmationTimeout } = require('../../src/shared')
const { encryptionSecret } = require('../../src/config')
const app = require('../../src/app')

const fromAddress = '0x627306090abaB3A6e1422e9345bC60c78a8BEf57'
const toAddress = '0xf17f52151ebef6c7334fad080c5704d77216b732'

describe('Transfer HTTP API', () => {
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

    this.user2 = await User.create({
      email: 'user2@originprotocol.com',
      name: 'User 2'
    })

    this.grants = [
      await Grant.create({
        // Fully vested grant
        userId: this.user.id,
        start: moment().subtract(4, 'years'),
        end: moment(),
        cliff: moment().subtract(3, 'years'),
        amount: 1000000,
        interval: 'days'
      }),
      // Fully unvested grant
      await Grant.create({
        userId: this.user.id,
        start: moment().add(10, 'years'),
        end: moment().add(14, 'years'),
        cliff: moment().add(11, 'years'),
        amount: 10000000,
        interval: 'days'
      }),
      // Grant for second user
      await Grant.create({
        userId: this.user2.id,
        start: moment().subtract(6, 'months'),
        end: moment()
          .add(6, 'months')
          .add(3, 'years'),
        cliff: moment().add(6, 'months'),
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

  it('should return the transfers', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Success,
      fromAddress,
      toAddress,
      amount: 10000,
      currency: 'OGN'
    })
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Success,
      fromAddress,
      toAddress,
      amount: 100000,
      currency: 'OGN'
    })

    const response = await request(this.mockApp).get('/api/transfers')

    expect(response.body.length).to.equal(2)
  })

  it('should not add a transfer if unlock date has not passed', async () => {
    const unlockFake = sinon.fake.returns(moment().add(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 1000,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })

    expect(response.text).to.match(/Unlock/)
  })

  it('should not return transfers for other users', async () => {
    // Create a transfer for a grant for the second user
    await Transfer.create({
      userId: this.user2.id,
      status: enums.TransferStatuses.Success,
      fromAddress,
      toAddress,
      amount: 10000,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .get('/api/transfers')
      .expect(200)

    // Amount of transfers should be the same as the amount created for the
    // first user
    expect(response.body.length).to.equal(0)
  })

  it('should add a transfer if lockup date has passed', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    const sendStub = sinon.stub(sendgridMail, 'send')

    await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 1000,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })

    const response = await request(this.mockApp).get('/api/transfers')
    expect(response.body.length).to.equal(1)
    expect(response.body[0].status).to.equal('WaitingEmailConfirm')

    // Check an email was sent with the confirmation token
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should not add a transfer before lockup date passed', async () => {
    const unlockFake = sinon.fake.returns(moment().add(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 1000,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/locked/)

    expect(
      (await request(this.mockApp).get('/api/transfers')).body.length
    ).to.equal(0)
  })

  it('should not add a transfer if not enough tokens (vested)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 1000001,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)

    expect(
      (await request(this.mockApp).get('/api/transfers')).body.length
    ).to.equal(0)
  })

  it('should not add a transfer if not enough tokens (vested minus enqueued)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 999999,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)

    expect(
      (await request(this.mockApp).get('/api/transfers')).body.length
    ).to.equal(1)
  })

  it('should not add a transfer if not enough tokens (vested minus paused)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Paused,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 999999,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)

    expect(
      (await request(this.mockApp).get('/api/transfers')).body.length
    ).to.equal(1)
  })

  it('should not add a transfer if not enough tokens (vested minus waiting)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingConfirmation,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 999999,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)

    expect(
      (await request(this.mockApp).get('/api/transfers')).body.length
    ).to.equal(1)
  })

  it('should not add a transfer if not enough tokens (vested minus success)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Success,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 999999,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)

    expect(
      (await request(this.mockApp).get('/api/transfers')).body.length
    ).to.equal(1)
  })

  it('should not add a transfer if not enough tokens (multiple states)', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)

    const promises = [
      enums.TransferStatuses.Enqueued,
      enums.TransferStatuses.Paused,
      enums.TransferStatuses.WaitingConfirmation,
      enums.TransferStatuses.Success
    ].map(status => {
      return Transfer.create({
        userId: this.user.id,
        status: status,
        toAddress: toAddress,
        amount: 2,
        currency: 'OGN'
      })
    })

    await Promise.all(promises)

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 999993,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)

    expect(
      (await request(this.mockApp).get('/api/transfers')).body.length
    ).to.equal(4)
  })

  it('should not add transfers simultaneously if not enough tokens', async () => {
    const results = await Promise.all([
      request(this.mockApp)
        .post('/api/transfers')
        .send({
          amount: 1000000,
          address: toAddress,
          code: totp.gen(this.otpKey)
        }),
      request(this.mockApp)
        .post('/api/transfers')
        .send({
          amount: 1,
          address: toAddress,
          code: totp.gen(this.otpKey)
        })
    ])

    expect(results.some(result => result.status === 422)).to.equal(true)

    // 1 transfer should be created because 1 failed
    expect(
      (await request(this.mockApp).get('/api/transfers')).body.length
    ).to.equal(1)
  })

  it('should not add a transfer if amount less than 0', async () => {
    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: -10,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/greater/)
  })

  it('should not add a transfer if amount 0', async () => {
    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 0,
        address: toAddress,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/greater/)
  })

  it('should confirm a transfer', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingEmailConfirm,
      toAddress: toAddress,
      amount: 1000000,
      currency: 'OGN'
    })

    const token = jwt.sign(
      {
        transferId: transfer.id
      },
      encryptionSecret,
      { expiresIn: `${transferConfirmationTimeout}m` }
    )

    await request(this.mockApp)
      .post(`/api/transfers/${transfer.id}`)
      .send({ token })
      .expect(201)

    const updatedTransfer = await Transfer.findOne({
      where: { id: transfer.id }
    })

    expect(updatedTransfer.status).to.equal(enums.TransferStatuses.Enqueued)
  })

  it('should not confirm a transfer with invalid token', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingEmailConfirm,
      toAddress: toAddress,
      amount: 1000000,
      currency: 'OGN'
    })

    const token = jwt.sign(
      {
        transferId: 'invalid'
      },
      encryptionSecret,
      { expiresIn: `${transferConfirmationTimeout}m` }
    )

    const response = await request(this.mockApp)
      .post(`/api/transfers/${transfer.id}`)
      .send({ token })
      .expect(400)

    expect(response.text).to.match(/Invalid/)
  })

  it('should not confirm a transfer with an expired token', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingEmailConfirm,
      toAddress: toAddress,
      amount: 1000000,
      currency: 'OGN'
    })

    const token = jwt.sign(
      {
        transferId: transfer.id
      },
      encryptionSecret,
      { expiresIn: `${transferConfirmationTimeout}m` }
    )

    // Go forward in time to expire the token
    const clock = sinon.useFakeTimers(
      moment
        .utc()
        .add(transferConfirmationTimeout, 'm')
        .valueOf()
    )

    const response = await request(this.mockApp)
      .post(`/api/transfers/${transfer.id}`)
      .send({ token })
      .expect(400)

    expect(response.text).to.match(/expired/)
    clock.restore()
  })

  it('should not add a transfer if unconfirmed lockups greater than balance', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    transferController.__Rewire__('getInvestorUnlockDate', unlockFake)
    lockupController.__Rewire__('getInvestorUnlockDate', unlockFake)

    const earnOgnFake = sinon.fake.returns(true)
    lockupController.__Rewire__('getEarnOgnEnabled', earnOgnFake)

    const otpCode = totp.gen(this.otpKey)

    const sendStub = sinon.stub(sendgridMail, 'send')

    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 1000000,
        code: otpCode
      })
      .expect(201)

    const response = await request(this.mockApp)
      .post('/api/transfers')
      .send({
        amount: 1,
        address: toAddress,
        code: otpCode
      })
      .expect(422)

    expect(response.text).to.match(/exceeds/)

    // Check an email was sent with the confirmation token for one of the
    // two requests
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })
})
