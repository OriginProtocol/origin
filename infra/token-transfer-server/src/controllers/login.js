const express = require('express')
const router = express.Router()
const passport = require('passport')
const base32 = require('thirty-two')
const sendgridMail = require('@sendgrid/mail')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const { ip2geo } = require('@origin/ip2geo')

require('../passport')()
const { asyncMiddleware } = require('../utils')
const { LOGIN } = require('../constants/events')
const { encrypt } = require('../lib/crypto')
const { Event, User } = require('../models')
const logger = require('../logger')
const { ensureLoggedIn, ensureUserInSession } = require('../lib/login')

// Sendgrid configuration.
const emailFrom = process.env.SENDGRID_FROM_EMAIL
if (!emailFrom) {
  logger.error('SENDGRID_FROM_EMAIL must be set through EnvKey or manually')
  process.exit(1)
}

const apiKey = process.env.SENDGRID_API_KEY
if (!emailFrom) {
  logger.error('SENDGRID_API_KEY must be set through EnvKey or manually')
  process.exit(1)
}

sendgridMail.setApiKey(apiKey)

/**
 * Sends a login code by email.
 */
router.post(
  '/send_email_token',
  asyncMiddleware(async (req, res) => {
    const email = req.body.email
    logger.debug('/send_email_code called for', email)

    // Check the user exists before sending an email code.
    const user = await User.findOne({ where: { email } })
    if (user) {
      const token = jwt.sign(
        {
          email
        },
        process.env.ENCRYPTION_SECRET,
        { expiresIn: '5m' }
      )

      const data = {
        to: email,
        from: emailFrom,
        subject: 'Your T3 verification code',
        text: `Welcome to the Origin Investor Portal. Here is your single-use sign in link.

        ${process.env.PORTAL_URL ||
          'http://localhost:3000'}/login_handler/${token}.

        It will expire in 5 minutes. You can reply directly to this email with any questions.`
      }
      await sendgridMail.send(data)
      logger.info(`Sent email token to ${email}`)
    } else {
      // Do nothing in case email not found in our DB.
      // But do not let the caller know by returning anything different,
      // to avoid tipping them on whether or not the email exists.
      logger.info(`Email ${email} not found in DB. No token sent.`)
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
  ensureUserInSession, // User must have verified their email first.
  asyncMiddleware(async (req, res) => {
    if (req.user.otpKey && req.user.otpVerified) {
      // Two-factor auth has already been setup. Do not allow reset.
      res.status(403)
      return res.send('TOTP already setup')
    }

    // TOTP not setup yet. Generate a key and save it encrypted in the DB.
    // TOTP setup is not complete until it has been verified and the otpVerified
    // flag on the user model has been set to true. Until that time the user
    // can regenerate this key.
    const key = crypto.randomBytes(10).toString('hex')
    const encodedKey = base32.encode(key).toString()
    const encryptedKey = encrypt(key)
    await req.user.update({ otpKey: encryptedKey })

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
  ensureUserInSession, // User must have verified their email first.
  passport.authenticate('totp'),
  asyncMiddleware(async (req, res) => {
    // Set otpVerified to true if it is not already to signify TOTP setup is
    // complete.
    await req.user.update({ otpVerified: true })
    //
    // Log the successfull login in the Event table.
    await Event.create({
      email: req.user.email,
      ip: req.connection.remoteAddress,
      grantId: null,
      action: LOGIN,
      data: JSON.stringify({
        device: req.useragent,
        location: await ip2geo(req.connection.remoteAddress)
      })
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
