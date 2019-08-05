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

describe('twitter webhooks', () => {
  beforeEach(async () => {
    process.env.TWITTER_WEBHOOKS_CONSUMER_SECRET = 'abcdef'
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
              screen_name: 'testaccount'
            }
          }
        ]
      })
      .expect(200)

    const event = JSON.parse(await getAsync('twitter/follow/testaccount'))
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

    const event = JSON.parse(await getAsync('twitter/share/someuser'))
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
              screen_name: 'unknownuser'
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
              screen_name: 'unknownuser'
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

    let event = await getAsync('twitter/share/unknownuser')
    expect(event).to.equal(null)
    event = await getAsync('twitter/share/originprotocol')
    expect(event).to.equal(null)
  })
})
