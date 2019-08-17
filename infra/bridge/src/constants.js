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
  },
  KAKAO_BASE_AUTH_URL: 'https://kauth.kakao.com/oauth',
  KAKAO_PROFILE_URL: 'https://kapi.kakao.com/v2/user/me',
  GITHUB_BASE_AUTH_URL: 'https://github.com/login/oauth',
  GITHUB_PROFILE_URL: 'https://api.github.com/user',
  LINKEDIN_BASE_AUTH_URL: 'https://www.linkedin.com/oauth/v2',
  LINKEDIN_PROFILE_URL: 'https://api.linkedin.com/v2/me',
  WECHAT_BASE_AUTH_URL: 'https://open.weixin.qq.com/connect/qrconnect',
  WECHAT_BASE_API_URL: 'https://api.weixin.qq.com/sns'
})
