'use strict'

const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/facebook', (req, res) => {
  if (req.query.dappRedirectUrl) {
    const dappRedirectUrl = req.query.dappRedirectUrl
    res.redirect(`${dappRedirectUrl}?origin-code=${req.query.code}`)
  } else {
    // res.sendFile requires absoluite paths and ../ is considered malicious
    // so resolve first
    res.sendFile(path.resolve(`${__dirname}/../static/facebook.html`))
  }
})

router.get('/twitter', (req, res) => {
  if (req.query.dappRedirectUrl) {
    const dappRedirectUrl = req.query.dappRedirectUrl
    res.redirect(`${dappRedirectUrl}?origin-code=${req.query.oauth_verifier}`)
  } else {
    // res.sendFile requires absoluite paths and ../ is considered malicious
    // so resolve first
    res.sendFile(path.resolve(`${__dirname}/../static/twitter.html`))
  }
})

router.get('/google', (req, res) => {
  if (req.query.dappRedirectUrl) {
    const dappRedirectUrl = req.query.dappRedirectUrl
    res.redirect(`${dappRedirectUrl}?origin-code=${req.query.code}`)
  } else {
    // res.sendFile requires absoluite paths and ../ is considered malicious
    // so resolve first
    res.sendFile(path.resolve(`${__dirname}/../static/google.html`))
  }
})

module.exports = router
