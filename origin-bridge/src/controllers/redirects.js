const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')

router.get('/facebook', (req, res) => {
  if (req.query.dappRedirectUrl) {
    const dappRedirectUrl = req.query.dappRedirectUrl
    res.redirect(dappRedirectUrl + '?origin-code=' + req.query.code)
  } else {
    res.sendfile('src/static/facebook.html')
  }
})

router.get('/twitter', (req, res) => {
  if (req.query.dappRedirectUrl) {
    const dappRedirectUrl = req.query.dappRedirectUrl
    res.redirect(dappRedirectUrl + '?origin-code=' + req.query.oauth_verifier)
  } else {
    res.sendfile('src/static/twitter.html')
  }
})

module.exports = router
