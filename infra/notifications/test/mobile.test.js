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
        eth_address: '1234',
        device_token: '5678',
        device_type: 'FCM',
        permissions: {}
      })
      .expect(201)
  })

  it(`should upsert on existing row`, async () => {})
})
