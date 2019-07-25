'use strict'

const OAuth = require('oauth').OAuth
const { getAbsoluteUrl } = require('./index.js')

function twitterOAuth({ sid, redirectUrl } = {}) {
  return new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
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
  oAuthVerifier
) {
  return new Promise((resolve, reject) => {
    twitterOAuth().getOAuthAccessToken(
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

function verifyTwitterCredentials(oAuthAccessToken, oAuthAccessTokenSecret) {
  return new Promise((resolve, reject) => {
    twitterOAuth().get(
      'https://api.twitter.com/1.1/account/verify_credentials.json',
      oAuthAccessToken,
      oAuthAccessTokenSecret,
      function(error, response) {
        if (error) {
          reject(error)
        } else {
          /* eslint-disable-next-line */
          const { id, screen_name } = JSON.parse(response)
          resolve({
            uniqueId: id,
            username: screen_name,
            /* eslint-disable-next-line */
            profileUrl: `https://twitter.com/${screen_name}`
          })
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
