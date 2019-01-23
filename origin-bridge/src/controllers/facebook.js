const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')

const { getAbsoluteUrl, mapObjectToQueryParams } = require('../utils')
const constants = require('../constants')

router.get('/auth-url', (req, res) => {
  client_id = process.env.FACEBOOK_CLIENT_ID
  redirect_uri = getAbsoluteUrl('/redirects/facebook/')
  params = {
    client_id: client_id,
    redirect_uri: redirect_uri
  }
  url = constants.FACEBOOK_BASE_AUTH_URL + mapObjectToQueryParams(params)
  res.send({url: url})
})

router.post('/verify', (req, res) => {
})

module.exports = router
