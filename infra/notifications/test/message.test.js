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

    this.sender = '0x78655b524c1dc1cbfacda55620249f3afdbfbf3b'
    this.receiver = '0x627306090abab3a6e1400e9345bc60c78a8bef57'

    // Create an identity and register mobile for the receiver.
    await MobileRegistry.create({
      ethAddress: this.receiver,
      deviceToken: 'testToken',
      permissions: { alert: true },
      deviceType: 'APN'
    })
    await Identity.create({
      ethAddress: this.receiver,
      email: 'foo@bar.com'
    })
  })

  it(`Should send an email and a mobile push notification`, async () => {
    await request(app)
      .post('/messages')
      .send({
        sender: this.sender,
        receivers: [this.receiver],
        messageHash: 'ABCD'
      })
      .expect(200)

    // There should be 2 entries in notification_log, one for email and the
    // other for the mobile push.
    const logEmail = await NotificationLog.findOne({
      where: { ethAddress: this.receiver, channel: 'email' }
    })
    expect(logEmail).to.be.an('object')
    const logMobile = await NotificationLog.findOne({
      where: { ethAddress: this.receiver, channel: 'mobile-ios' }
    })
    expect(logMobile).to.be.an('object')
  })
})
