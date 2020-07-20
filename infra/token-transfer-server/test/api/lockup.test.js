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

process.env.ENCRYPTION_SECRET = 'test'
process.env.LOCKUP_BONUS_RATE = 10.5
process.env.LOCKUP_DURATION = 12

const { Grant, Lockup, Transfer, User, sequelize } = require('../../src/models')
const { encrypt } = require('../../src/lib/crypto')
const lockupController = require('../../src/controllers/lockup')
const enums = require('../../src/enums')
const {
  earlyLockupBonusRate,
  encryptionSecret,
  lockupBonusRate,
  lockupConfirmationTimeout
} = require('../../src/config')
const app = require('../../src/app')
const { getNextVest } = require('../../src/shared')
const { getBalance } = require('../../src/lib/balance')

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

    this.grants = [
      // Fully vested grant
      await Grant.create({
        userId: this.user.id,
        start: moment().subtract(4, 'years'),
        end: moment(),
        cliff: moment().subtract(3, 'years'),
        amount: 100000
      }),
      // Vesting in the future
      await Grant.create({
        userId: this.user.id,
        start: moment().add(1, 'years'),
        end: moment().add(4, 'years'),
        cliff: moment().add(1, 'years'),
        amount: 10000000
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

    const lockupsEnabledFake = sinon.fake.returns(true)
    lockupController.__Rewire__('getLockupsEnabled', lockupsEnabledFake)

    const earlyLockupsEnabledFake = sinon.fake.returns(true)
    lockupController.__Rewire__(
      'getEarlyLockupsEnabled',
      earlyLockupsEnabledFake
    )
  })

  it('should return the lockups', async () => {
    await Lockup.create({
      userId: this.user.id,
      amount: 1000,
      start: moment.utc(),
      end: moment.utc().add(1, 'years'),
      code: totp.gen(this.otpKey),
      bonusRate: 10.0,
      confirmed: true
    })

    const response = await request(this.mockApp)
      .get('/api/lockups')
      .expect(200)

    expect(response.body.length).to.equal(1)
  })

  it('should add a lockup', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 1000,
        code: totp.gen(this.otpKey)
      })
      .expect(201)

    expect(Number(response.body.bonusRate)).to.equal(lockupBonusRate)

    expect(
      (await request(this.mockApp).get('/api/lockups')).body.length
    ).to.equal(1)

    // Check an email was sent with the confirmation token
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should add a early lockup', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 600000, // Full amount possible, first investor vest is 6%
        early: true,
        code: totp.gen(this.otpKey)
      })

    expect(Number(response.body.amount)).to.equal(600000)
    expect(Number(response.body.bonusRate)).to.equal(earlyLockupBonusRate)

    expect(
      (await request(this.mockApp).get('/api/lockups')).body.length
    ).to.equal(1)

    // Check an email was sent with the confirmation token
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should add a early lockup using multiple vests occurring on same day', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    // Add another grant with the same parameters as the grant being used for
    // the next vest tests, which will mean there are multiple vests on the same
    // day
    this.grants.push(
      await Grant.create({
        userId: this.grants[1].userId,
        start: this.grants[1].start,
        end: this.grants[1].end,
        amount: this.grants[1].amount
      })
    )

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 600000 * 2, // Full amount possible
        early: true,
        code: totp.gen(this.otpKey)
      })
      .expect(201)

    expect(Number(response.body.amount)).to.equal(600000 * 2)
    expect(Number(response.body.bonusRate)).to.equal(earlyLockupBonusRate)

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

    await request(this.mockApp)
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

  it('should not add a lockup if flag is false', async () => {
    const lockupsEnabledFake = sinon.fake.returns(false)
    lockupController.__Rewire__('getLockupsEnabled', lockupsEnabledFake)

    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100,
        code: totp.gen(this.otpKey)
      })
      .expect(404)
  })

  it('should allow adding a lockup if early lockup exists with combined lockup amounts greater than balance', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')
    const nextVest = getNextVest(
      this.grants.map(g => g.get({ plain: true })),
      this.user.get({ plain: true })
    )
    const balance = await getBalance(this.user.id)

    // Lock up entire next vest
    await Lockup.create({
      userId: this.user.id,
      amount: Number(nextVest.amount),
      start: moment().subtract(1, 'days'),
      end: moment()
        .add(1, 'years')
        .add(1, 'days'),
      bonusRate: 10.0,
      data: {
        vest: nextVest
      },
      confirmed: true
    })

    // Lock up entire balance
    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: balance,
        code: totp.gen(this.otpKey)
      })
      .expect(201)

    // Check an email was sent with the confirmation token
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should not add a early lockup if flag is disabled', async () => {
    const earlyLockupsEnabledFake = sinon.fake.returns(false)
    lockupController.__Rewire__(
      'getEarlyLockupsEnabled',
      earlyLockupsEnabledFake
    )

    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100,
        early: true,
        code: totp.gen(this.otpKey)
      })
      .expect(404)
  })

  it('should not add a lockup if unlock date has not passed', async () => {
    const unlockFake = sinon.fake.returns(moment().add(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/Unlock/)
  })

  it('should not add a lockup if unconfirmed lockup exists', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    await Lockup.create({
      userId: this.user.id,
      amount: 1000,
      start: moment()
        .subtract(1, 'years')
        .subtract(1, 'days'),
      end: moment().subtract(1, 'years'),
      code: totp.gen(this.otpKey),
      bonusRate: 10.0
    })

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/Unconfirmed/)
  })

  it('should add a lockup if unconfirmed lockup exists older than expiry', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)
    const sendStub = sinon.stub(sendgridMail, 'send')

    await Lockup.create({
      userId: this.user.id,
      amount: 1000,
      start: moment()
        .subtract(1, 'years')
        .subtract(1, 'days'),
      end: moment().subtract(1, 'years'),
      code: totp.gen(this.otpKey),
      bonusRate: 10.0,
      createdAt: moment().subtract(10, 'minutes')
    })

    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100,
        code: totp.gen(this.otpKey)
      })
      .expect(201)

    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should add a lockup if confirmed lockup exists', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)
    const sendStub = sinon.stub(sendgridMail, 'send')

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

    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100,
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
    lockupController.__Rewire__('getUnlockDate', unlockFake)

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
    lockupController.__Rewire__('getUnlockDate', unlockFake)

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
    lockupController.__Rewire__('getUnlockDate', unlockFake)

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
    lockupController.__Rewire__('getUnlockDate', unlockFake)

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
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    await Lockup.create({
      userId: this.user.id,
      amount: 2,
      start: moment().subtract(1, 'days'),
      end: moment()
        .add(1, 'years')
        .add(1, 'days'),
      bonusRate: 10.0,
      confirmed: true
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

  it('should not add lockups simultaneously', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')

    const results = await Promise.all([
      request(this.mockApp)
        .post('/api/lockups')
        .send({
          amount: 100000,
          code: totp.gen(this.otpKey)
        }),
      request(this.mockApp)
        .post('/api/lockups')
        .send({
          amount: 100,
          code: totp.gen(this.otpKey)
        })
    ])

    expect(
      results.filter(
        result => result.status !== 201 && result.text.match(/Unconfirmed/)
      ).length
    ).to.equal(1)

    // 1 lockup should be created because 1 failed
    expect(
      (await request(this.mockApp).get('/api/lockups')).body.length
    ).to.equal(1)

    // Check an email was sent with the confirmation token
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should not add a transfer and lockup simultaneously if not enough balance', async () => {
    const sendStub = sinon.stub(sendgridMail, 'send')

    const results = await Promise.all([
      request(this.mockApp)
        .post('/api/transfers')
        .send({
          amount: 100000,
          address: '0xf17f52151ebef6c7334fad080c5704d77216b732',
          code: totp.gen(this.otpKey)
        }),
      request(this.mockApp)
        .post('/api/lockups')
        .send({
          amount: 100,
          code: totp.gen(this.otpKey)
        })
    ])

    expect(results.filter(result => result.status !== 201).length).to.equal(1)

    // Check an email was sent with the confirmation token
    expect(sendStub.called).to.equal(true)
    sendStub.restore()
  })

  it('should not add lockups with amount below 100', async () => {
    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: -10,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/greater/)
  })

  it('should not add an early lockup if not enough tokens in next vest', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    // Small lockup which should succeed
    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100,
        early: true,
        code: totp.gen(this.otpKey)
      })

    // Lockup the same size as the first vesting event
    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 600000,
        early: true,
        code: totp.gen(this.otpKey)
      })
      .expect(422)
  })

  it('should not add an early lockup if not enough tokens in multiple same day next vest', async () => {
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    // Add another grant with the same parameters as the grant being used for
    // the next vest tests, which will mean there are multiple vests on the same
    // day
    this.grants.push(
      await Grant.create({
        userId: this.grants[1].userId,
        start: this.grants[1].start,
        end: this.grants[1].end,
        amount: this.grants[1].amount
      })
    )

    // Small lockup which should succeed
    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 100,
        early: true,
        code: totp.gen(this.otpKey)
      })

    // Lockup the same size as the first vesting event
    await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 600000 * 2, // Full amount from combined same day next vests
        early: true,
        code: totp.gen(this.otpKey)
      })
      .expect(422)
  })

  it('should not add an early lockup if no next vest', async () => {
    const clock = sinon.useFakeTimers(moment.utc(this.grants[1].end).valueOf())
    const unlockFake = sinon.fake.returns(moment().subtract(1, 'days'))
    lockupController.__Rewire__('getUnlockDate', unlockFake)

    const response = await request(this.mockApp)
      .post('/api/lockups')
      .send({
        amount: 1000,
        early: true,
        code: totp.gen(this.otpKey)
      })
      .expect(422)

    expect(response.text).to.match(/Amount of 1000 OGN exceeds the 0 available/)

    clock.restore()
  })

  it('should confirm a lockup', async () => {
    const lockup = await Lockup.create({
      userId: this.user.id,
      amount: 1000000
    })

    const token = jwt.sign(
      {
        lockupId: lockup.id
      },
      encryptionSecret,
      { expiresIn: `${lockupConfirmationTimeout}m` }
    )

    await request(this.mockApp)
      .post(`/api/lockups/${lockup.id}`)
      .send({ token })
      .expect(201)

    const updatedLockup = await Lockup.findOne({
      where: { id: lockup.id }
    })

    expect(updatedLockup.confirmed).to.equal(true)
  })

  it('should not confirm a lockup with invalid token', async () => {
    const lockup = await Lockup.create({
      userId: this.user.id,
      amount: 1000000
    })

    const token = jwt.sign(
      {
        lockupId: 'invalid'
      },
      encryptionSecret,
      { expiresIn: `${lockupConfirmationTimeout}m` }
    )

    const response = await request(this.mockApp)
      .post(`/api/lockups/${lockup.id}`)
      .send({ token })
      .expect(400)

    expect(response.text).to.match(/Invalid/)
  })

  it('should not confirm a lockup with an expired token', async () => {
    const lockup = await Lockup.create({
      userId: this.user.id,
      amount: 1000000
    })

    const token = jwt.sign(
      {
        lockupId: lockup.id
      },
      encryptionSecret,
      { expiresIn: `${lockupConfirmationTimeout}m` }
    )

    // Go forward in time to expire the token
    const clock = sinon.useFakeTimers(
      moment
        .utc()
        .add(lockupConfirmationTimeout, 'm')
        .valueOf()
    )

    const response = await request(this.mockApp)
      .post(`/api/lockups/${lockup.id}`)
      .send({ token })
      .expect(400)

    expect(response.text).to.match(/expired/)
    clock.restore()
  })
})
