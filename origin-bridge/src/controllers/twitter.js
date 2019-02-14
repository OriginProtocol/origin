const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')
const { asyncMiddleware, getTwitterOAuthRequestToken, mapObjectToQueryParams} = require('../utils')
const constants = require('../constants')

router.get('/auth-url', asyncMiddleware(async (req, res) => {
  const { oAuthToken, oAuthTokenSecret } = await getTwitterOAuthRequestToken()
  url = constants.TWITTER_BASE_AUTH_URL + mapObjectToQueryParams({'oauth_token': oAuthToken})
  res.send({url})
}))

router.post('/verify', (req, res) => {
})

module.exports = router
