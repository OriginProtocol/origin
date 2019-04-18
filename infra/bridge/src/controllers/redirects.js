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

router.get('/twitter', async (req, res) => {
  const sessionID = req.query.state

  if (sessionID) {
    const session = await req.sessionStore.get(sessionID)
    if (!session) {
      return res.send('Session not found')
    }

    session.code = req.query.oauth_verifier
    await new Promise(resolve =>
      req.sessionStore.set(sessionID, session, resolve)
    )

    res.redirect(`${session.redirect}?sid=${sessionID}`)
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
