const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/app')
const MobileRegistry = require('../src/models/index').MobileRegistry

const { generateToken } = require('@origin/auth-utils/src/utils')

// Just an account for testing purpose
const USER_ADDRESS = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'

const getAuthToken = async () => {
  const tokenData = await generateToken({
    address: USER_ADDRESS
  })

  return tokenData.authToken
}

describe('register device token endpoint', () => {
  beforeEach(() => {
    process.env.AUTH_PUB_KEY =
      '-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAzO41ktS3XoXFnHs/Yxcc\n2/BcBBFadv+dD02V72RaD6KOZZZ0Uq4zrSATAHhMf/HDpCXww286+rkHCHaVwMcW\n/iaT0f0ThPy9vp6GYXLYdUh5dyr4wUqMQirV3wGEUjbpLHAHaSR5N0OFLEV5Px7F\nPQr0Azz96gKHUoaVeCdiWVSs295fEI+lOBnD93zqWwb2N9UPV2ltga5ju3AsSYv6\nUi5IWAMM9cJ5UDHMC0+wCnhPxn98e1jT3frXCzSt3IiduyuvsZUxJmBkwOfsXKqS\nndK6eiVRajO3d/qORVPHQ2w4kkgs6M2t6vxxr9juRy11eYEw1KLXYiDXEVosIqYZ\nhGo2UrKC2oDkME/VZqHKiP8rjd9tBlK/BpH5YhnaOyKV7U3MKlvbVn3HyAJE6KuE\nsjU7i43SaW3rLref4DKbiJGCYhOI+J7AvRp26HSFAQhHh0k0K33zDDuxrCPom6rt\n4fGG8mqunuh6X6LeZh1TsoAuPyJMt1WkQA7gsRUmPkqSRLjLrKCPmYCf/9jIEjXB\nrUoGF0MQ2mNfCoupv7psb0+AfH00p/P9alZ8UxU1uDlydzGHjSOMnRM9Jgi1nSAR\nENEa8ux7V7N46AgKyQW4pAyn6q5kkkNzVUSTpNTbG4WW6jNMJdw5ENbYeB7DoBjC\nJSbqa16RDaDk39v+49ke8TkCAwEAAQ==\n-----END PUBLIC KEY-----\n'
    process.env.AUTH_PRIV_KEY =
      '-----BEGIN ENCRYPTED PRIVATE KEY-----\n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\nHIJtrWMU3TJ8p8fBa8qirZFqFlqNE2dU7ToIDBIh43ZpWwKhE8pRrXU7ckDPHRPJ\nbczehlXLTLxZ63VuEMEV34MLX9Ex7mjnIUDxiKZf5pyK/rxggs33T+Rfbx19tq6Q\ntHciWOs1D3zwO61x92zM//u9YqCScMFv/Q2wuqeWFri8IbQoGJL1KjlwLXKK0chA\nDKCWtpwTayzNwYuEPMkhwELnvd8eiqDAXobe4eKAw68T4nkwIyt5wI9f6Mb2afAZ\n9kN/lfa9H6rKtyP/aSQJxPUpqfnTvZNsZMMPKsC8qc/5FaJUZwgRcCBDkqyOZGN2\nSePnO/LsNetnsQsxHv6SsS+LNOiKPmKHfmjIKYjQkDc59IIjS1Fr+Ninq19PStGi\n2iVnxUHiejBjG9z2VqKiVPOO2szrMGWXzjc7JbhwU9fcsT8YTm9LJK5oCoe0L4rT\n22HMUCHEalxeuZOW/crj/Wd9adIUPDWMzsaOqVmkLB4siHGhzjDsAO8UDJWiqPDe\nbxnA5Jj0I6dLIgdsKIWLQ9/6xIYguZHuDi+vyG+KlJiTRiGLLUuuQb8NsaXylsq6\nFs9d3SIMTT6DUqJKOaZgeHfofiSQbK7c/oenMYWFQomg0VaSs9fZJxWVCDDiFzEW\n04fZye3reSkM6qsrK/KmcdXVrQolx4guW43tHRhldo72vQ2vGcy8ZLLfYPlI8x6d\n4PwqlbPzVc5w0xtEVD5c1AiB7/Xqk1QmyVSO04rToDLW/oKIi8DE5NTWSCP6ovup\nmmpWbGMKP8U+huq1l3I92kQ8cX6CloSFZ71Fc+fna8SDi140VGJG18qezaPfoq3z\ncMVnTPM+p4wMEyJT2j99HzRlTHguFSw6wyNleFSd6Osb\n-----END ENCRYPTED PRIVATE KEY-----\n'

    MobileRegistry.destroy({
      where: {},
      truncate: true
    })
  })

  // A temporary test to prevent hard-fail of notifications.
  it(`should not fail without token`, async () => {
    await request(app)
      .post('/mobile/register')
      .send({
        eth_address: USER_ADDRESS,
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
