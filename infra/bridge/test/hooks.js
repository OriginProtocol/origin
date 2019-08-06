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
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'rOlK2y3cO0EnsVh2JrVqglj75zStF4mcN5HmyWvqMlQ='
      })
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
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'aMPAoi2EHMNU6/rL0TtAtbBx0R1ZoNbYL72Gbin3X0o='
      })
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
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'ht8B0jY6QyEl1t2qbPs0jul3lRexDD5TCQN/L9MfykA='
      })
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

  it('should fail on invalid signature', async () => {
    await request(app)
      .post('/hooks/twitter')
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'aMPAoi2EHMNU6/rL0TtAtbBx0R1ZoNbYL72Gbin3X0o='
      })
      .send({
        tweet_create_events: [
          {
            id: 'abcd',
            user: {
              id_str: '123456',
              screen_name: 'someuser'
            }
          }
        ]
      })
      .expect(403)
  })
})
