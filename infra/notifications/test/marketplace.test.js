const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/app')
const Identity = require('@origin/identity/src/models').Identity
const MobileRegistry = require('../src/models/index').MobileRegistry
const NotificationLog = require('../src/models').NotificationLog

const OfferAccepted = require('./fixtures/OfferAccepted.json')

describe('Email and MobilePush notifications for Marketplace events', () => {
  before(async () => {
    await MobileRegistry.destroy({ where: {}, truncate: true })
    await NotificationLog.destroy({ where: {}, truncate: true })
    await Identity.destroy({ where: {}, truncate: true })

    this.seller = '0xf17f52151ebef6c7334fad080c5704d77216b732'
    this.buyer = '0x627306090abab3a6e1400e9345bc60c78a8bef57'

    // Create an identity and a mobile registration for the seller.
    await MobileRegistry.create({
      ethAddress: this.seller,
      deviceToken: 'testTokenSeller',
      permissions: { alert: true },
      deviceType: 'APN'
    })
    await Identity.create({
      ethAddress: this.seller,
      email: 'buyer@foo.com'
    })

    // Create an identity and a mobile registration for the buyer.
    await MobileRegistry.create({
      ethAddress: this.buyer,
      deviceToken: 'testTokenBuyer',
      permissions: { alert: true },
      deviceType: 'APN'
    })
    await Identity.create({
      ethAddress: this.buyer,
      email: 'seller@foo.com'
    })
  })

  it(`Should skip an unprocessable event`, async () => {
    await request(app)
      .post('/events')
      .send({ event: { event: 'InvalidEventName' } })
      .expect(200)
  })

  it(`Should error on an invalid event`, async () => {
    await request(app)
      .post('/events')
      .send({ event: { event: 'OfferAccepted' } })
      .expect(400)
  })

  it(`Should send an email and a mobile push notification for an offer accepted`, async () => {
    await request(app)
      .post('/events')
      .send(OfferAccepted)
      .expect(200)

    // For an offer acceptance, only the buyer gets notified.
    // There should be 2 entries in notification_log, one for email and the
    // other for the mobile push.
    const logEmail = await NotificationLog.findOne({
      where: { ethAddress: this.buyer, channel: 'email' }
    })
    expect(logEmail).to.be.an('object')
    const logMobile = await NotificationLog.findOne({
      where: { ethAddress: this.buyer, channel: 'mobile-ios' }
    })
    expect(logMobile).to.be.an('object')
  })
})
