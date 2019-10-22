const express = require('express')
const router = express.Router()
const passport = require('passport')
const base32 = require('thirty-two')
const crypto = require('crypto')

require('../passport')()
const { asyncMiddleware, getFingerprintData } = require('../utils')
const { LOGIN } = require('../constants/events')
const { encrypt } = require('../lib/crypto')
const { Event } = require('../models')
const logger = require('../logger')
const { sendLoginToken } = require('../lib/email')
const { ensureLoggedIn } = require('../lib/login')

/**
 * Sends a login code by email.
 */
router.post(
  '/send_email_token',
  asyncMiddleware(async (req, res) => {
    const email = req.body.email
    logger.debug('/send_email_code called for', email)

    // No await to prevent enumeration of valid emails
    if (process.env.NODE_ENV !== 'test') {
      sendLoginToken(email)
    }

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ email }))
  })
)

/**
 * Verifies a login code sent by email.
 */
router.post(
  '/verify_email_token',
  passport.authenticate('bearer'),
  (req, res) => {
    logger.debug('/verify_email_token called')
    res.json({
      email: req.user.email,
      otpReady: Boolean(req.user.otpKey && req.user.otpVerified)
    })
  }
)

/**
  Returns data for setting up TOTP.
 */
router.post(
  '/setup_totp',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    // TOTP not setup yet. Generate a key and save it encrypted in the DB.
    // TOTP setup is not complete until it has been verified and the otpVerified
    // flag on the user model has been set to true. Until that time the user
    // can regenerate this key.
    const key = crypto.randomBytes(10).toString('hex')
    const encodedKey = base32.encode(key).toString()
    const encryptedKey = encrypt(key)
    await req.user.update({ otpKey: encryptedKey, otpVerified: false })

    // Generate QR token for scanning into Google Authenticator
    // Reference: https://code.google.com/p/google-authenticator/wiki/KeyUriFormat
    const otpUrl = `otpauth://totp/${req.user.email}?secret=${encodedKey}&period=30&issuer=OriginProtocol`
    const otpQrUrl =
      'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=' +
      encodeURIComponent(otpUrl)

    res.setHeader('Content-Type', 'application/json')
    res.send(
      JSON.stringify({
        email: req.user.email,
        otpKey: encodedKey,
        otpQrUrl
      })
    )
  })
)

/**
 * Verifies a TOTP code.
 */
router.post(
  '/verify_totp',
  (req, res, next) => {
    // Skip two factor auth for this endpoint
    ensureLoggedIn(req, res, next, true)
  },
  passport.authenticate('totp'),
  asyncMiddleware(async (req, res) => {
    // Set otpVerified to true if it is not already to signify TOTP setup is
    // complete.
    await req.user.update({ otpVerified: true })

    // Log the successfull login in the Event table.
    await Event.create({
      userId: req.user.id,
      action: LOGIN,
      data: await getFingerprintData(req)
    })

    // Save in the session that the user successfully authed with TOTP.
    req.session.twoFA = 'totp'

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ email: req.user.email }))
  })
)

/**
 * Log out user by destroying their session cookie
 */
router.post('/logout', ensureLoggedIn, (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        logger.error('ERROR destroying session:', err)
      }
    })
  }
  res.send('200').end()
})

module.exports = router
