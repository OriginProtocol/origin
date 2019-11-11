const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')
const totp = require('notp').totp
const base32 = require('thirty-two')
const crypto = require('crypto')
const moment = require('moment')

const { Event, User, sequelize } = require('../../src/models')
const { encrypt } = require('../../src/lib/crypto')

process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const app = require('../../src/app')

describe('Login HTTP API', () => {
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
      otpVerified: true,
      revisedScheduleAgreedAt: moment(),
      termsAgreedAt: moment().subtract(1, 'hours')
    })

    this.user2 = await User.create({
      email: 'user2@originprotocol.com',
      name: 'User 2',
      otpKey: '123'
    })

    this.user3 = await User.create({
      email: 'user3@originprotocol.com',
      name: 'User 3',
      otpVerified: true
    })
  })

  it('should send an email token', async () => {
    await request(app)
      .post('/api/send_email_token')
      .send({ email: this.user.email })
      .expect(200)
  })

  it('should verify a valid email token', async () => {
    const token = jwt.sign(
      {
        email: this.user.email
      },
      process.env.ENCRYPTION_SECRET,
      { expiresIn: '5m' }
    )

    const response = await request(app)
      .post('/api/verify_email_token')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(response.body.email).to.equal(this.user.email)
    expect(response.body.otpVerified).to.equal(true)
  })

  it('should verify and return data correctly for second user', async () => {
    const token = jwt.sign(
      {
        email: this.user2.email
      },
      process.env.ENCRYPTION_SECRET,
      { expiresIn: '5m' }
    )

    const response = await request(app)
      .post('/api/verify_email_token')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(response.body.email).to.equal(this.user2.email)
    expect(response.body.otpVerified).to.equal(null)
  })

  it('should verify and return data correctly for third user', async () => {
    const token = jwt.sign(
      {
        email: this.user3.email
      },
      process.env.ENCRYPTION_SECRET,
      { expiresIn: '5m' }
    )

    const response = await request(app)
      .post('/api/verify_email_token')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    console.log(response.body)
    expect(response.body.email).to.equal(this.user3.email)
    expect(response.body.otpVerified).to.equal(true)
  })

  it('should reject an invalid token', async () => {
    const token = jwt.sign(
      {
        email: this.user.email
      },
      'Invalid Encryption Secret',
      { expiresIn: '5m' }
    )

    await request(app)
      .post('/api/verify_email_token')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
  })

  it('should allow setting of phone if totp not verified', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user2.id
        }
      }
      next()
    })
    mockApp.use(app)

    const phone = '12345678'

    const response = await request(mockApp)
      .post('/api/user')
      .send({ phone })
      .expect(200)

    expect(response.body.phone).to.equal(phone)
  })

  it('should allow setting of revised schedule agreed date if totp not verified', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user2.id
        }
      }
      next()
    })
    mockApp.use(app)

    const revisedScheduleAgreedAt = moment()

    const response = await request(mockApp)
      .post('/api/user')
      .send({ revisedScheduleAgreedAt })
      .expect(200)

    expect(response.body.revisedScheduleAgreedAt).to.equal(
      revisedScheduleAgreedAt.utc().toISOString()
    )
  })

  it('should allow setting of terms agreed date if totp not verified', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user2.id
        }
      }
      next()
    })
    mockApp.use(app)

    const termsAgreedAt = moment()

    const response = await request(mockApp)
      .post('/api/user')
      .send({ termsAgreedAt })
      .expect(200)

    expect(response.body.termsAgreedAt).to.equal(
      termsAgreedAt.utc().toISOString()
    )
  })

  it('should not allow changing of revised schedule agreed date if set', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user2.id
        }
      }
      next()
    })
    mockApp.use(app)

    await this.user2.update({
      revisedScheduleAgreedAt: moment().subtract(10, 'minutes')
    })

    const revisedScheduleAgreedAt = moment()
    const response = await request(mockApp)
      .post('/api/user')
      .send({ revisedScheduleAgreedAt })
      .expect(200)

    expect(response.body.revisedScheduleAgreedAt).to.equal(
      this.user2.revisedScheduleAgreedAt.toISOString()
    )
  })

  it('should not allow changing of terms agreed date if set', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user2.id
        }
      }
      next()
    })
    mockApp.use(app)

    await this.user2.update({
      termsAgreedAt: moment().subtract(10, 'minutes')
    })

    const termsAgreedAt = moment()

    const response = await request(mockApp)
      .post('/api/user')
      .send({ termsAgreedAt })
      .expect(200)

    expect(response.body.termsAgreedAt).to.equal(
      this.user2.termsAgreedAt.toISOString()
    )
  })

  it('should not allow setup of totp if already verified', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user.id
        }
      }
      next()
    })
    mockApp.use(app)

    await request(mockApp)
      .post('/api/setup_totp')
      .expect(401)
  })

  it('should allow setup of totp if not verified', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user2.id
        }
      }
      next()
    })
    mockApp.use(app)

    const response = await request(mockApp)
      .post('/api/setup_totp')
      .expect(200)

    expect(response.body.email).to.equal(this.user2.email)
    expect(response.body.otpKey).to.be.a('string')
    expect(response.body.otpQrUrl).to.be.a('string')
  })

  it('should verify a valid totp and record a login event', async () => {
    const mockApp = express()
    mockApp.use((req, res, next) => {
      req.session = {
        passport: {
          user: this.user.id
        }
      }
      next()
    })
    mockApp.use(app)

    // Uses notp package, which is the same that is used by passport-totp
    const totpToken = totp.gen(this.otpKey)

    await request(mockApp)
      .post('/api/verify_totp')
      .send({ code: totpToken })
      .expect(200)

    // TODO verify 2fa in session

    const events = await Event.findAll({ where: { userId: this.user.id } })
    expect(events.length).to.equal(1)
    expect(events[0].data.device.browser).to.equal('node-superagent')
    expect(events[0].data.device.version).to.equal('3.8.3')
    expect(events[0].data.device.platform).to.equal('unknown')
    // TODO stub the return from ip2geo
    expect(events[0].data.location).to.equal(null)
  })
})
