'use strict'

const express = require('express')
const router = express.Router()
const path = require('path')

const oauth2RedirectHandler = async (req, res) => {
  const sessionID = req.query.state

  if (sessionID) {
    const session = await req.sessionStore.get(sessionID)
    if (!session) {
      return res.status(400).send('Session not found')
    }

    req.session.code = session.code = req.query.code
    await req.sessionStore.set(sessionID, session)

    res.redirect(`${session.redirect}?sid=${sessionID}`)
  } else {
    // res.sendFile requires absoluite paths and ../ is considered malicious
    // so resolve first
    res.sendFile(path.resolve(`${__dirname}/../static/oauth2.html`))
  }
}

router.get('/twitter', async (req, res) => {
  const sessionID = req.query.sid

  const session = await req.sessionStore.get(sessionID)
  if (!session) {
    return res.status(400).send('Session not found')
  }

  if (session.redirect) {
    // In case of redirect, verifier code is stored to session
    req.session.code = session.code = req.query.oauth_verifier
    await req.sessionStore.set(sessionID, session)

    res.redirect(`${session.redirect}?sid=${sessionID}`)
  } else {
    // res.sendFile requires absoluite paths and ../ is considered malicious
    // so resolve first
    res.sendFile(path.resolve(`${__dirname}/../static/twitter.html`))
  }
})

router.get('/facebook', oauth2RedirectHandler)

router.get('/google', oauth2RedirectHandler)

router.get('/kakao', oauth2RedirectHandler)

router.get('/github', oauth2RedirectHandler)

router.get('/linkedin', oauth2RedirectHandler)

router.get('/wechat', oauth2RedirectHandler)

module.exports = router
