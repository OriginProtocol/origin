'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/app')

const crypto = require('crypto')

const Sequelize = require('sequelize')

const env = process.env.NODE_ENV || 'test'
const config = require(__dirname + '/../config/sequelize.js')[env]

const sequelize = new Sequelize(process.env[config.use_env_variable], config)

const Attestation = require('../src/models/index').Attestation

const ethAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010'

const sleep = timeInMs => new Promise(resolve => setTimeout(resolve, timeInMs))

const createFakeAttestation = async ({
  type,
  ethAddress,
  uniqueId,
  username
}) => {
  await Attestation.create({
    method: type || 'TWITTER',
    ethAddress,
    value: uniqueId || '123',
    signature: '',
    remoteIpAddress: '127.0.0.1',
    profileUrl: '',
    username,
    profileData: '{}'
  })
}

const checkIfGrowthEventExists = async ({ contentHash, identity, type }) => {
  let data
  if (contentHash) {
    data = await sequelize.query(
      `SELECT * FROM growth_event WHERE eth_address=:ethAddress AND type=:type AND status='Logged' AND custom_id=:customId`,
      {
        replacements: {
          type,
          ethAddress: identity,
          customId: contentHash
        }
      }
    )
  } else {
    data = await sequelize.query(
      `SELECT * FROM growth_event WHERE eth_address=:ethAddress AND type=:type AND status='Logged'`,
      {
        replacements: {
          type,
          ethAddress: identity
        }
      }
    )
  }

  return data[0].length > 0
}

describe('twitter webhooks', () => {
  beforeEach(async () => {
    process.env.TWITTER_WEBHOOKS_CONSUMER_SECRET = 'abcdef'
    process.env.TWITTER_ORIGINPROTOCOL_USERNAME = 'OriginProtocol'

    await sequelize.query('DELETE from growth_event')

    await Attestation.destroy({
      where: {},
      truncate: true
    })
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

  it('should push follow events to DB', async () => {
    await createFakeAttestation({
      username: 'testaccount',
      ethAddress
    })
    await request(app)
      .post('/hooks/twitter')
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'sha256=rOlK2y3cO0EnsVh2JrVqglj75zStF4mcN5HmyWvqMlQ='
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

    await sleep(1000)

    expect(
      await checkIfGrowthEventExists({
        identity: ethAddress,
        type: 'FollowedOnTwitter'
      })
    ).to.equal(true)
  })

  it('should push mention events to DB', async () => {
    await createFakeAttestation({
      username: 'someuser',
      ethAddress
    })

    await request(app)
      .post('/hooks/twitter')
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'sha256=hCsjrrpDU6kzSP5TpgW2T3yO7BaU4qdi5Mqlp1BuTKE='
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
            },
            text: 'hello world'
          }
        ]
      })
      .expect(200)

    await sleep(1000)

    expect(
      await checkIfGrowthEventExists({
        identity: ethAddress,
        type: 'SharedOnTwitter'
      })
    ).to.equal(true)
  })

  it('should not push events if no attestation found', async () => {
    await request(app)
      .post('/hooks/twitter')
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'sha256=uK7XMMoqeDXBokDjta1Qh3rwQy18BE9ICS84baL4zHk='
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
              screen_name: 'testaccountxyz'
            }
          }
        ]
      })
      .expect(200)

    await sleep(1000)

    expect(
      await checkIfGrowthEventExists({
        identity: ethAddress,
        type: 'FollowedOnTwitter'
      })
    ).to.equal(false)
  })

  it('should not push retweets/favorites/own tweet events to DB', async () => {
    await createFakeAttestation({
      username: 'unknownuser',
      ethAddress
    })

    await createFakeAttestation({
      username: 'originprotocol',
      ethAddress
    })

    await request(app)
      .post('/hooks/twitter')
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'sha256=ht8B0jY6QyEl1t2qbPs0jul3lRexDD5TCQN/L9MfykA='
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

    await sleep(1000)

    expect(
      await checkIfGrowthEventExists({
        identity: ethAddress,
        type: 'SharedOnTwitter'
      })
    ).to.equal(false)
  })

  it('should fail on invalid signature', async () => {
    await request(app)
      .post('/hooks/twitter')
      .set({
        // Note: These signs have been hard-coded in the test
        // Don't forget to update it, if you make any change to the body
        'x-twitter-webhooks-signature':
          'sha256=aMPAoi2EHMNU6/rL0TtAtbBx0R1ZoNbYL72Gbin3X0o='
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

describe('telegram webhooks', () => {
  beforeEach(async () => {
    await sequelize.query('DELETE from growth_event')

    await Attestation.destroy({
      where: {},
      truncate: true
    })
  })

  it('should push follow events to DB', async () => {
    await createFakeAttestation({
      username: 'testaccount',
      ethAddress,
      type: 'TELEGRAM'
    })

    await request(app)
      .post('/hooks/telegram')
      .send({
        message: {
          new_chat_members: [
            {
              id: 'abc',
              username: 'testaccount',
              is_bot: false
            }
          ]
        }
      })
      .expect(200)

    await sleep(1000)

    expect(
      await checkIfGrowthEventExists({
        identity: ethAddress,
        type: 'FollowedOnTelegram'
      })
    ).to.equal(true)
  })

  it('should ignore follow events of bots', async () => {
    await createFakeAttestation({
      username: 'test_bot',
      ethAddress,
      type: 'TELEGRAM'
    })

    await request(app)
      .post('/hooks/telegram')
      .send({
        message: {
          new_chat_members: [
            {
              id: 'abc',
              username: 'test_bot',
              is_bot: true
            }
          ]
        }
      })
      .expect(200)

    await sleep(1000)

    expect(
      await checkIfGrowthEventExists({
        identity: ethAddress,
        type: 'FollowedOnTelegram'
      })
    ).to.equal(false)
  })

  it('should not push events if no attestation found', async () => {
    await request(app)
      .post('/hooks/telegram')
      .send({
        message: {
          new_chat_members: [
            {
              id: 'abc',
              username: 'unknown_user',
              is_bot: false
            }
          ]
        }
      })
      .expect(200)

    await sleep(1000)

    expect(
      await checkIfGrowthEventExists({
        identity: ethAddress,
        type: 'FollowedOnTelegram'
      })
    ).to.equal(false)
  })
})
