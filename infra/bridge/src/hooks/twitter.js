'use strict'

const { OAuth } = require('oauth')
const { redisClient } = require('../utils/redis')

const logger = require('./../logger')

const oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_ORIGIN_CONSUMER_KEY,
  process.env.TWITTER_ORIGIN_CONSUMER_SECRET,
  '1.0',
  null,
  'HMAC-SHA1'
)

const HOST = process.env.NODE_ENV === 'development' ? process.env.WEBHOOK_TUNNEL_HOST : process.env.HOST

const HOOK_ENV = process.env.TWITTER_WEBHOOK_ENV || 'dev'

function registerTwitterHook() {
  return new Promise((resolve, reject) => {
    oauth.post(`https://api.twitter.com/1.1/account_activity/all/${HOOK_ENV}/webhooks.json?url=${encodeURIComponent(`https://${HOST}/hooks/twitter`)}`,
      process.env.TWITTER_ORIGIN_ACCESS_TOKEN,
      process.env.TWITTER_ORIGIN_ACCESS_TOKEN_SECRET,
      null,
      null,
      function (err, response) {
        if (err) {
          return reject(err)
        } else {
          return resolve(JSON.parse(response))
        }
      }
    )
  })
}

function getTwitterHooks() {
  return new Promise((resolve, reject) => {
    oauth.get(`https://api.twitter.com/1.1/account_activity/all/webhooks.json?url=${encodeURIComponent(`https://${HOST}/hooks/twitter`)}`,
      process.env.TWITTER_ORIGIN_ACCESS_TOKEN,
      process.env.TWITTER_ORIGIN_ACCESS_TOKEN_SECRET,
      function (err, response) {
        if (err) {
          return reject(err)
        } else {
          return resolve(JSON.parse(response))
        }
      }
    )
  })
}

async function subscribeToHooks() {
  const resp = await getTwitterHooks()
  const environment = resp.environments.find(e => e.environment_name === HOOK_ENV)

  if (!environment) {
    throw new Error('Webhook environment not found')
  }

  let webhookId
  if (!environment.webhooks || environment.webhooks.length === 0) {
    // Create a webhook, if none exists
    const resp = await registerTwitterHook()
    webhookId = resp.id
  } else {
    webhookId = environment.webhooks[0].id
  }

  new Promise((resolve, reject) => {
    oauth.post(`https://api.twitter.com/1.1/account_activity/webhooks/${webhookId}/subscriptions.json`,
      process.env.TWITTER_ORIGIN_ACCESS_TOKEN,
      process.env.TWITTER_ORIGIN_ACCESS_TOKEN_SECRET,
      null,
      null,
      function (err, response) {
        if (err) {
          return reject(err)
        } else {
          return resolve(JSON.parse(response))
        }
      }
    )
  })
  .catch(e => {
    logger.error(e)
  }) 
}

module.exports = {
  subscribeToHooks
}