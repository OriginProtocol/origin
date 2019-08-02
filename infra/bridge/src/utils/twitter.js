'use strict'

const OAuth = require('oauth').OAuth
const { getAbsoluteUrl } = require('./index.js')

function twitterOAuth({ sid, redirectUrl, useWebhookCredentials } = {}) {
  return new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    useWebhookCredentials && process.env.TWITTER_WEBHOOKS_CONSUMER_KEY
      ? process.env.TWITTER_WEBHOOKS_CONSUMER_KEY
      : process.env.TWITTER_CONSUMER_KEY,
    useWebhookCredentials && process.env.TWITTER_WEBHOOKS_CONSUMER_SECRET
      ? process.env.TWITTER_WEBHOOKS_CONSUMER_SECRET
      : process.env.TWITTER_CONSUMER_SECRET,
    '1.0',
    getAbsoluteUrl(redirectUrl ? redirectUrl : '/redirects/twitter/', { sid }),
    'HMAC-SHA1'
  )
}

function getTwitterOAuthRequestToken(params = {}) {
  return new Promise((resolve, reject) => {
    twitterOAuth(params).getOAuthRequestToken(function(
      error,
      oAuthToken,
      oAuthTokenSecret
    ) {
      if (error) {
        reject(error)
      } else {
        resolve({ oAuthToken, oAuthTokenSecret })
      }
    })
  })
}

function getTwitterOAuthAccessToken(
  oAuthToken,
  oAuthTokenSecret,
  oAuthVerifier,
  useWebhookCredentials
) {
  return new Promise((resolve, reject) => {
    twitterOAuth({ useWebhookCredentials }).getOAuthAccessToken(
      oAuthToken,
      oAuthTokenSecret,
      oAuthVerifier,
      function(error, oAuthAccessToken, oAuthAccessTokenSecret) {
        if (error) {
          reject(error)
        } else {
          resolve({ oAuthAccessToken, oAuthAccessTokenSecret })
        }
      }
    )
  })
}

function verifyTwitterCredentials(
  oAuthAccessToken,
  oAuthAccessTokenSecret,
  useWebhookCredentials
) {
  return new Promise((resolve, reject) => {
    twitterOAuth({ useWebhookCredentials }).get(
      'https://api.twitter.com/1.1/account/verify_credentials.json',
      oAuthAccessToken,
      oAuthAccessTokenSecret,
      function(error, response) {
        if (error) {
          reject(error)
        } else {
          /* eslint-disable-next-line */
          resolve(JSON.parse(response))
        }
      }
    )
  })
}

module.exports = {
  getTwitterOAuthRequestToken,
  getTwitterOAuthAccessToken,
  verifyTwitterCredentials
}
