'use strict'

module.exports = Object.freeze({
  FACEBOOK_BASE_AUTH_URL: 'https://www.facebook.com/v3.2/dialog/oauth?',
  FACEBOOK_BASE_GRAPH_URL: 'https://graph.facebook.com',
  TWITTER_BASE_AUTH_URL: 'https://api.twitter.com/oauth/authenticate?',
  GOOGLE_BASE_AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth?',
  GOOGLE_BASE_API_URL: 'https://www.googleapis.com',
  ISSUER: {
    name: 'Origin Protocol',
    url: 'https://www.originprotocol.com',
    ethAddress: process.env.ATTESTATION_ACCOUNT
  }
})
