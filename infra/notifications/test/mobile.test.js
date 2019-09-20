const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/app')
const MobileRegistry = require('../src/models/index').MobileRegistry

describe('register device token endpoint', () => {
  beforeEach(() => {
    MobileRegistry.destroy({
      where: {},
      truncate: true
    })
  })

  it(`should add a new row`, async () => {
    await request(app)
      .post('/mobile/register')
      .send({
        eth_address: '0x78655B524c1dc1CbfacDA55620249F3AFDbFBf3B',
        device_token: '5678',
        device_type: 'FCM',
        permissions: {}
      })
      .expect(201)

    const results = await MobileRegistry.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(
      '0x78655b524c1dc1cbfacda55620249f3afdbfbf3b'
    )
    expect(results[0].deviceToken).to.equal('5678')
    expect(results[0].deviceType).to.equal('FCM')
    expect(results[0].deleted).to.equal(false)
  })

  it(`should upsert on existing row`, async () => {
    await request(app)
      .post('/mobile/register')
      .send({
        eth_address: '0x78655B524c1dc1CbfacDA55620249F3AFDbFBf3B',
        device_token: '5678',
        device_type: 'FCM',
        permissions: {}
      })
      .expect(201)

    await request(app)
      .post('/mobile/register')
      .send({
        eth_address: '0x78655B524c1dc1CbfacDA55620249F3AFDbFBf3B',
        device_token: '5678',
        device_type: 'FCM',
        permissions: { alert: 1, sound: 1, badge: 1 }
      })
      .expect(200)

    const results = await MobileRegistry.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].permissions.alert).to.equal(1)
    expect(results[0].permissions.sound).to.equal(1)
    expect(results[0].permissions.badge).to.equal(1)
  })

  it(`should toggle deleted attribute on delete request`, async () => {
    await request(app)
      .post('/mobile/register')
      .send({
        eth_address: '0x78655B524c1dc1CbfacDA55620249F3AFDbFBf3B',
        device_token: '5678',
        device_type: 'FCM',
        permissions: {}
      })
      .expect(201)

    await request(app)
      .delete('/mobile/register')
      .send({
        eth_address: '0x78655B524c1dc1CbfacDA55620249F3AFDbFBf3B',
        device_token: '5678'
      })
      .expect(200)

    const results = await MobileRegistry.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].deleted).to.equal(true)
  })
})
