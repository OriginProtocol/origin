'use strict'

const express = require('express')
const router = express.Router()

router.get('/facebook', (req, res) => {
  if (req.query.dappRedirectUrl) {
    const dappRedirectUrl = req.query.dappRedirectUrl
    res.redirect(`${dappRedirectUrl}?origin-code=${req.query.code}`)
  } else {
    res.sendFile('src/static/facebook.html')
  }
})

router.get('/twitter', (req, res) => {
  if (req.query.dappRedirectUrl) {
    const dappRedirectUrl = req.query.dappRedirectUrl
    res.redirect(`${dappRedirectUrl}?origin-code=${req.query.oauth_verifier}`)
  } else {
    res.sendFile('src/static/twitter.html')
  }
})

module.exports = router
