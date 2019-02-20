module.exports = Object.freeze({
  FACEBOOK_BASE_AUTH_URL: 'https://www.facebook.com/v3.2/dialog/oauth?',
  FACEBOOK_BASE_GRAPH_URL: 'https://graph.facebook.com',
  TWITTER_BASE_AUTH_URL: 'https://api.twitter.com/oauth/authenticate?',
  ISSUER: {
    name: 'Origin Protocol',
    url: 'https://www.originprotocol.com',
    ethAddress: process.env.ATTESTATION_ACCOUNT
  }
})
