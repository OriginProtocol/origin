const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/app')
const Identity = require('@origin/identity/src/models').Identity
const MobileRegistry = require('../src/models/index').MobileRegistry
const NotificationLog = require('../src/models').NotificationLog

describe('MobilePush notifications for Admin Tool', () => {
  before(async () => {
    await MobileRegistry.destroy({ where: {}, truncate: true })
    await NotificationLog.destroy({ where: {}, truncate: true })
    await Identity.destroy({ where: {}, truncate: true })

    this.sender = '0x78655b524c1dc1cbfacda55620249f3afdbfbf3b'
    this.receiver = '0x627306090abab3a6e1400e9345bc60c78a8bef57'

    // Create an identity and register mobile for the receiver.
    for (let i = 0; i < 10; i++) {
      const ethAddress =
        '0x627306090abab3a6e1400e9345bc60c78a8bef' + String(i).padStart(2, '0')

      await MobileRegistry.create({
        ethAddress,
        deviceToken: 'testToken' + String(i),
        permissions: { alert: true },
        deviceType: 'APN'
      })

      await MobileRegistry.create({
        ethAddress,
        deviceToken: 'testToken' + String(100 + i),
        permissions: { alert: true },
        deviceType: 'FCM'
      })

      await Identity.create({
        ethAddress,
        email: `foo${i}@bar.com`
      })
    }
  })

  it(`Should send a mobile push notification to specific address`, async () => {
    const targetAddress = '0x627306090abab3a6e1400e9345bc60c78a8bef01'
    await request(app)
      .post('/send_pn')
      .send({
        target: 'address',
        targetAddress,
        title: 'Test message',
        body: 'Test message body',
        payload: {
          url: 'test url'
        }
      })
      .expect(200)

    const iosLog = await NotificationLog.findOne({
      where: { ethAddress: targetAddress, channel: 'mobile-ios' }
    })
    expect(iosLog).to.be.an('object')

    const androidLog = await NotificationLog.findOne({
      where: { ethAddress: targetAddress, channel: 'mobile-android' }
    })
    expect(androidLog).to.be.an('object')

    await NotificationLog.destroy({ where: {}, truncate: true })
  })

  it(`Should send a mobile push notification to multiple addresses`, async () => {
    const targetAddress = [
      '0x627306090abab3a6e1400e9345bc60c78a8bef02',
      '0x627306090abab3a6e1400e9345bc60c78a8bef03',
      '0x627306090abab3a6e1400e9345bc60c78a8bef04'
    ]
    await request(app)
      .post('/send_pn')
      .send({
        target: 'address',
        targetAddress,
        title: 'Test message 2',
        body: 'Test message body 2',
        payload: {
          url: 'test url'
        }
      })
      .expect(200)

    for (const address of targetAddress) {
      const iosLog = await NotificationLog.findOne({
        where: { ethAddress: address, channel: 'mobile-ios' }
      })
      expect(iosLog).to.be.an('object')

      const androidLog = await NotificationLog.findOne({
        where: { ethAddress: address, channel: 'mobile-android' }
      })
      expect(androidLog).to.be.an('object')
    }

    const shouldNotHaveSentTo = [
      '0x627306090abab3a6e1400e9345bc60c78a8bef01',
      '0x627306090abab3a6e1400e9345bc60c78a8bef05'
    ]

    for (const address of shouldNotHaveSentTo) {
      const log = await NotificationLog.findOne({
        where: { ethAddress: address }
      })
      expect(log).to.be.null
    }

    await NotificationLog.destroy({ where: {}, truncate: true })
  })

  it(`Should send a mobile push notification to all addresses`, async () => {
    const targetAddress = [
      '0x627306090abab3a6e1400e9345bc60c78a8bef01',
      '0x627306090abab3a6e1400e9345bc60c78a8bef02',
      '0x627306090abab3a6e1400e9345bc60c78a8bef03',
      '0x627306090abab3a6e1400e9345bc60c78a8bef04',
      '0x627306090abab3a6e1400e9345bc60c78a8bef05'
    ]
    await request(app)
      .post('/send_pn')
      .send({
        target: 'all',
        title: 'Test message 2',
        body: 'Test message body 2',
        payload: {
          url: 'test url'
        }
      })
      .expect(200)

    for (const address of targetAddress) {
      const iosLog = await NotificationLog.findOne({
        where: { ethAddress: address, channel: 'mobile-ios' }
      })
      expect(iosLog).to.be.an('object')

      const androidLog = await NotificationLog.findOne({
        where: { ethAddress: address, channel: 'mobile-android' }
      })
      expect(androidLog).to.be.an('object')
    }

    await NotificationLog.destroy({ where: {}, truncate: true })
  })
})
