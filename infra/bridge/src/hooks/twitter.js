'use strict'

const { OAuth } = require('oauth')
const request = require('superagent')

const logger = require('./../logger')

const oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  '1.0',
  null,
  'HMAC-SHA1'
)

const HOST =
  process.env.NODE_ENV === 'development'
    ? process.env.WEBHOOK_TUNNEL_HOST
    : process.env.HOST

const HOOK_ENV = process.env.TWITTER_WEBHOOK_ENV || 'dev'

/**
 * List all registered webhooks
 * @param {String} oAuthToken
 * @param {String} oAuthAccessTokenSecret
 */
function getWebhooks(oAuthToken, oAuthAccessTokenSecret) {
  return new Promise((resolve, reject) => {
    oauth.get(
      `https://api.twitter.com/1.1/account_activity/all/webhooks.json?url=${encodeURIComponent(
        `https://${HOST}/hooks/twitter`
      )}`,
      oAuthToken,
      oAuthAccessTokenSecret,
      function(err, response) {
        if (err) {
          return reject(err)
        } else {
          return resolve(JSON.parse(response))
        }
      }
    )
  })
}

/**
 * Add a new webhook
 * @param {String} oAuthToken
 * @param {String} oAuthAccessTokenSecret
 */
function createWebhook(oAuthToken, oAuthAccessTokenSecret) {
  return new Promise((resolve, reject) => {
    oauth.post(
      `https://api.twitter.com/1.1/account_activity/all/${HOOK_ENV}/webhooks.json?url=${encodeURIComponent(
        `https://${HOST}/hooks/twitter`
      )}`,
      oAuthToken,
      oAuthAccessTokenSecret,
      null,
      null,
      function(err, response) {
        if (err) {
          return reject(err)
        } else {
          return resolve(JSON.parse(response))
        }
      }
    )
  })
}

/**
 * Get application-only bearer token
 */
async function getBearerToken() {
  const response = await request
    .post('https://api.twitter.com/oauth2/token')
    .set({
      authorization:
        'Basic ' +
        Buffer.from(
          `${process.env.TWITTER_CONSUMER_KEY}:${process.env.TWITTER_CONSUMER_SECRET}`
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    })
    .send('grant_type=client_credentials')

  return response.body.access_token
}

/**
 * Delete webhook and remove all subscriptions
 * @param {String} webhookId Id of the webhook to be deleted
 * @param {String} bearerToken Application-only token
 */
function deleteWebhook(webhookId, bearerToken) {
  return request
    .delete(
      `https://api.twitter.com/1.1/account_activity/all/${HOOK_ENV}/webhooks/${webhookId}.json`
    )
    .set({
      authorization: `Bearer ${bearerToken}`
    })
}

/**
 * Subscribe to events of the user identified by oAuth token
 * @param {String} oAuthToken OAuth token of the user account to be subscribed
 * @param {Strign} oAuthAccessTokenSecret OAuth token secret of the user account to be subscribed
 */
function addSubscription(oAuthToken, oAuthAccessTokenSecret) {
  return new Promise((resolve, reject) => {
    oauth.post(
      `https://api.twitter.com/1.1/account_activity/all/${HOOK_ENV}/subscriptions.json`,
      oAuthToken,
      oAuthAccessTokenSecret,
      null,
      null,
      function(err, response) {
        if (err) {
          return reject(err)
        } else {
          return resolve(response)
        }
      }
    )
  })
}

/**
 * Create a webhook, if it doesn't exist, and subscribe to user events
 * @param {String} oAuthToken OAuth token of the user account to be subscribed
 * @param {Strign} oAuthAccessTokenSecret OAuth token secret of the user account to be subscribed
 */
async function subscribeToHooks(oAuthToken, oAuthAccessTokenSecret) {
  const resp = await getWebhooks(oAuthToken, oAuthAccessTokenSecret)
  logger.info('getWebhooks response:', resp)
  const environment = resp.environments.find(
    e => e.environment_name === HOOK_ENV
  )

  if (!environment) {
    logger.error(`Webhook environment ${HOOK_ENV} not found in response`, resp)
    throw new Error('Webhook environment not found')
  }
  logger.info('Using environment', environment)

  let webhookId
  if (!environment.webhooks || environment.webhooks.length === 0) {
    // Create a webhook, if none exists
    const response = await createWebhook(oAuthToken, oAuthAccessTokenSecret)
    webhookId = response.id
    logger.info(`Created new webhook with id ${webhookId}`)
  } else if (process.env.NODE_ENV === 'development') {
    // Webhook URLs cannot be updated
    // So, delete and recreate webhook on development
    // if there is a change in tunnel
    const bearerToken = await getBearerToken()
    await deleteWebhook(environment.webhooks[0].id, bearerToken)
    const response = await createWebhook(oAuthToken, oAuthAccessTokenSecret)
    webhookId = response.id
  } else {
    webhookId = environment.webhooks[0].id
  }

  logger.info(`Using twitter webhook: ${webhookId}`)

  await addSubscription(oAuthToken, oAuthAccessTokenSecret)
}

module.exports = {
  subscribeToHooks,
  deleteWebhook,
  getBearerToken
}
