const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/app')
const MobileRegistry = require('../src/models/index').MobileRegistry

const generateToken = require('@origin/auth-server/src/utils/generate-token')

const Eth = require('web3-eth')

const Web3Eth = new Eth()

const stringify = require('json-stable-stringify')

// Just an account for testing purpose
const USER_ADDRESS = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
const USER_PRIVATE_KEY =
  '0xC87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3'
const USER_ACCOUNT = Web3Eth.accounts.privateKeyToAccount(USER_PRIVATE_KEY)

// The actual message that the client will sign along with an timestamp
const AUTH_MESSAGE = 'SOME_AUTH_MESSAGE'

const signAuthMessage = (timestamp = Date.now()) => {
  const payload = stringify({
    message: AUTH_MESSAGE,
    timestamp
  })

  return {
    signature: USER_ACCOUNT.sign(payload).signature,
    payload: JSON.parse(payload),
    timestamp
  }
}

const getAuthToken = async () => {
  const { signature, payload } = signAuthMessage()

  const tokenData = await generateToken({
    address: USER_ADDRESS,
    signature,
    payload,
    ip: '0.0.0.0'
  })

  return tokenData.authToken
}

describe('register device token endpoint', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test'
    MobileRegistry.destroy({
      where: {},
      truncate: true
    })
  })

  it(`should add a new row`, async () => {
    await request(app)
      .post('/mobile/register')
      .set({
        authorization: `Bearer ${await getAuthToken()}`
      })
      .send({
        device_token: '5678',
        device_type: 'FCM',
        permissions: {}
      })
      .expect(201)

    const results = await MobileRegistry.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].ethAddress).to.equal(
      '0x627306090abab3a6e1400e9345bc60c78a8bef57'
    )
    expect(results[0].deviceToken).to.equal('5678')
    expect(results[0].deviceType).to.equal('FCM')
    expect(results[0].deleted).to.equal(false)
  })

  it(`should update on existing row`, async () => {
    await request(app)
      .post('/mobile/register')
      .set({
        authorization: `Bearer ${await getAuthToken()}`
      })
      .send({
        device_token: '5678',
        device_type: 'FCM',
        permissions: { alert: 1 }
      })
      .expect(201)

    await request(app)
      .post('/mobile/register')
      .set({
        authorization: `Bearer ${await getAuthToken()}`
      })
      .send({
        device_token: '5678',
        device_type: 'FCM',
        permissions: { alert: 2, sound: 1, badge: 1 }
      })
      .expect(200)

    const results = await MobileRegistry.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].permissions.alert).to.equal(2)
    expect(results[0].permissions.sound).to.equal(1)
    expect(results[0].permissions.badge).to.equal(1)
  })

  it(`should toggle deleted attribute on delete request`, async () => {
    await request(app)
      .post('/mobile/register')
      .set({
        authorization: `Bearer ${await getAuthToken()}`
      })
      .send({
        device_token: '5678',
        device_type: 'FCM',
        permissions: {}
      })
      .expect(201)

    await request(app)
      .delete('/mobile/register')
      .set({
        authorization: `Bearer ${await getAuthToken()}`
      })
      .send({
        device_token: '5678'
      })
      .expect(200)

    const results = await MobileRegistry.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].deleted).to.equal(true)
  })
})
