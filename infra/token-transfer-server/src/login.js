const base32 = require('thirty-two')
const sendgridMail = require('@sendgrid/mail')
const crypto = require('crypto')

const { LOGIN } = require('./constants/events')
const { encrypt } = require('./lib/crypto')
const { Event, User } = require('./models')
const logger = require('./logger')

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

function _generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Sends an email verification code.
 */
async function sendEmailCode(req, res) {
  const email = req.body.email
  logger.debug('/api/send_email_code called for', email)

  // Check the user exists before sending an email code.
  const user = await User.findOne({ where: { email } })
  if (user) {
    // Generate a random code and save it in the user's session.
    const code = _generateSixDigitCode()
    req.session.emailVerification = {
      code,
      ttl: Date.now() + 30 * 60 * 1000 // 30 min
    }

    const data = {
      to: email,
      from: emailFrom,
      subject: 'Your T3 verification code',
      text: `Your T3 verification code is ${code}. It will expire in 30 minutes.`
    }
    await sendgridMail.send(data)
    logger.info(`Sent email code to ${email}`)
  } else {
    // Do nothing in case email not found in our DB.
    // But do not let the caller know by returning anything different,
    // to avoid tipping them on whether or not the email exists.
    logger.info(`Email ${email} not found in DB. No code sent.`)
  }

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({ email }))
}

/**
 * Verifies an email code.
 * Note: see passport.js for the passport callback that performs the actual code verification.
 */
function verifyEmailCode(req, res) {
  logger.debug('/api/verify_email_code called')
  if (!req.user) {
    res.status(401)
    return res.send('User not authorized')
  }

  // Save in the session that the user successfully verified their email.
  req.session.email = req.user.email

  res.setHeader('Content-Type', 'application/json')
  res.send(
    JSON.stringify({
      email: req.user.email,
      otpReady: Boolean(req.user.otpKey)
    })
  )
}

/**
 * Returns information necessary to user for setting up TOTP.
 */
async function setupTotp(req, res) {
  logger.debug('/api/setup_totp called')
  if (req.user.otpKey) {
    // Two-factor auth has already been setup. Do not allow to reset it.
    res.status(403)
    return res.send('TOTP already setup.')
  }

  // TOTP  not setup yet. Generate a key and save it encrypted in the DB.
  const key = crypto.randomBytes(10).toString('hex')
  const encodedKey = base32.encode(key).toString()
  const encryptedKey = encrypt(key)
  await req.user.update({ otpKey: encryptedKey })

  // Generate QR code for scanning into Google Authenticator
  // Reference: https://code.google.com/p/google-authenticator/wiki/KeyUriFormat
  const otpUrl = `otpauth://totp/${req.user.email}?secret=${encodedKey}&period=30&issuer=OriginProtocol`
  const otpQrUrl =
    'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=' +
    encodeURIComponent(otpUrl)

  res.setHeader('Content-Type', 'application/json')
  res.send(
    JSON.stringify({ email: req.user.email, otpKey: encodedKey, otpQrUrl })
  )
}

/**
 * Verifies a TOTP code.
 * Note: see passport.js for the passport callback that performs the actual TOTP code verification.
 */
async function verifyTotp(req, res) {
  logger.debug('/api/verify_totp called')

  // Log the successfull login in the Event table.
  await Event.create({
    email: req.user.email,
    ip: req.connection.remoteAddress,
    grantId: null,
    action: LOGIN,
    data: JSON.stringify({})
  })

  // Save in the session that the user successfully authed with TOTP.
  req.session.twoFA = 'totp'

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({ email: req.user.email }))
}

/**
 * Destroys the user's session cookie.
 */
function logout(req, res) {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        logger.error('ERROR destroying session:', err)
      }
    })
  }
  res.send('logged out')
}

module.exports = {
  sendEmailCode,
  verifyEmailCode,
  setupTotp,
  verifyTotp,
  logout
}
