'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const redis = require('redis')

const app = require('../src/app')

const client = redis.createClient()
const crypto = require('crypto')

const getAsync = key =>
  new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

describe('promotion verifications', () => {
  beforeEach(async () => {
    process.env.TWITTER_CONSUMER_SECRET = 'abcdef'
    process.env.TWITTER_ORIGINPROTOCOL_USERNAME = 'OriginProtocol'

    // Clear out redis-mock
    await new Promise(resolve => client.del('*', resolve))
  })

  it('should return response token', async () => {
    const response = await request(app)
      .get('/hooks/twitter?crc_token=123456')
      .expect(200)

    const hmac = crypto
      .createHmac('sha256', 'abcdef')
      .update('123456')
      .digest('base64')

    expect(response.body.response_token).to.equal(`sha256=${hmac}`)
  })

  it('should push follow events to redis', async () => {
    await request(app)
      .post('/hooks/twitter')
      .send({
        follow_events: [
          {
            id: 'abc',
            target: {
              screen_name: 'originprotocol'
            },
            source: {
              id: '12345',
              screen_name: 'some random account'
            }
          }
        ]
      })
      .expect(200)

    const event = JSON.parse(await getAsync('twitter/follow/12345'))
    expect(event.id).to.equal('abc')
  })

  it('should push mention events to redis', async () => {
    await request(app)
      .post('/hooks/twitter')
      .send({
        tweet_create_events: [
          {
            id: 'abcd',
            user: {
              id_str: '123456',
              screen_name: 'someuser'
            },
            entities: {
              urls: []
            }
          }
        ]
      })
      .expect(200)

    const event = JSON.parse(await getAsync('twitter/share/123456'))
    expect(event.id).to.equal('abcd')
  })

  it('should not push retweets/favorites/own tweet events to redis', async () => {
    await request(app)
      .post('/hooks/twitter')
      .send({
        tweet_create_events: [
          {
            id: 'abcd',
            retweeted: true,
            user: {
              id_str: '9876',
              screen_name: 'someuser'
            },
            entities: {
              urls: []
            }
          },
          {
            id: 'abcd',
            favorited: true,
            user: {
              id_str: '9876',
              screen_name: 'someuser'
            },
            entities: {
              urls: []
            }
          },
          {
            id: 'abcd',
            user: {
              id_str: '9876',
              screen_name: 'originprotocol'
            },
            entities: {
              urls: []
            }
          }
        ]
      })
      .expect(200)

    const event = await getAsync('twitter/share/9876')
    expect(event).to.equal(null)
  })
})
