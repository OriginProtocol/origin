const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/app')
const Identity = require('@origin/identity/src/models').Identity
const MobileRegistry = require('../src/models/index').MobileRegistry
const NotificationLog = require('../src/models').NotificationLog

describe('Email and MobilePush notifications for Origin Messages', () => {
  before(async () => {
    await MobileRegistry.destroy({ where: {}, truncate: true })
    await NotificationLog.destroy({ where: {}, truncate: true })
    await Identity.destroy({ where: {}, truncate: true })

    await MobileRegistry.create({
      ethAddress: '0x123',
      deviceToken: 'testToken',
      permissions: { alert: true },
      deviceType: 'APN'
    })
    await Identity.create({
      ethAddress: '0x123',
      email: 'foo@bar.com'
    })
  })

  it(`Should send an email and a mobile push notification`, async () => {
    await request(app)
      .post('/messages')
      .send({
        sender: '0x78655B524c1dc1CbfacDA55620249F3AFDbFBf3B',
        receivers: ['0x123'],
        messageHash: 'ABCD'
      })
      .expect(200)

    // There should be 2 entries in notification_log, one for email and the
    // other for the mobile push.
    const logEmail = await NotificationLog.findOne({
      where: { channel: 'email' }
    })
    expect(logEmail).to.be.an('object')
    const logMobile = await NotificationLog.findOne({
      where: { channel: 'mobile-ios' }
    })
    expect(logMobile).to.be.an('object')
  })
})
