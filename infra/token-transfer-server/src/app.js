const logger = require('./logger')

try {
  require('envkey')
} catch (error) {
  logger.warn('EnvKey not configured')
}

const express = require('express')
const app = express()
const { check, validationResult } = require('express-validator')
const cors = require('cors')
const bodyParser = require('body-parser')
const moment = require('moment')
const port = process.env.PORT || 5000
const passport = require('passport')
const path = require('path')
const session = require('express-session')
require('./passport')()
const SQLiteStore = require('connect-sqlite3')(session)
const { Op } = require('sequelize')
const base32 = require('thirty-two')

const { createProviders } = require('@origin/token/src/config')

const { LOGIN } = require('./constants/events')
const { transferTokens } = require('./lib/transfer')
const { Event, Grant, User } = require('./models')
const { encrypt } = require('./lib/crypto')

const Web3 = require('web3')

// Read secrets from EnvKey.
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  logger.error('SESSION_SECRET must be set through EnvKey or manually')
  process.exit(1)
}

const networkId = Number.parseInt(process.env.NETWORK_ID) || 999

// Setup sessions.
app.use(
  session({
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour TTL
    resave: false,
    secure: false,
    saveUninitialized: true,
    secret: sessionSecret,
    store: new SQLiteStore({
      dir: path.resolve(__dirname + '/../data'),
      db: 'sessions.sqlite3'
    })
  })
)

// Expose extra headers.
app.use(
  cors({
    exposedHeaders: ['X-Authenticated-Email']
  })
)

// Parse request bodies.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Passport specific.
app.use(passport.initialize())
app.use(passport.session())


/**
 * Allows use of async functions for an Express route.
 */
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const logDate = () => moment().toString()

/**
 * Ensures a user is logged in.
 * Must be called by all routes.
 */
function ensureLoggedIn(req, res, next) {
  logger.debug('Calling ensureLoggedIn')
  if (!req.session.email) {
    logger.debug('Authentication failed. No email in session')
    res.status(401)
    return res.send('This action requires to verify your email.')
  }
  if (!req.session.twoFA) {
    logger.debug('Authentication failed. No 2FA in session')
    res.status(401)
    return res.send('This action requires 2FA.')
  }
  // User is authenticated and passed 2FA.
  logger.debug('Authentication success')
  res.setHeader('X-Authenticated-Email', req.session.email)
  next()
}

/**
 * Ensures a user verified their email.
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function ensureEmailVerified(req, res, next) {
  logger.debug('Calling ensureEmailVerified')
  if (!req.session.email) {
    logger.debug('Authentication failed. No email in session')
    res.status(401)
    return res.send('This action requires to verify your email first.')
  }
  next()
}

/**
 * Returns grants for the authenticated user.
 */
app.get(
  '/api/grants',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    logger.debug('/api/grants', req.session.email)
    const grants = await Grant.findAll({ where: { email: req.session.email } })
    const augmentedGrants = grants.map(grant => ({
      ...grant.get({ plain: true }),
      nextVest: grant.nextVesting()
    }))
    res.json(augmentedGrants)
  })
)

const isEthereumAddress = value => {
  if (!Web3.utils.isAddress(value)) {
    throw new Error('Address is not a valid Ethereum address')
  }
  return true
}

/**
 * Transfers tokens from hot wallet to address of user's choosing.
 */
app.post(
  '/api/transfer',
  [
    check('grantId').isInt(),
    check('amount').isDecimal(),
    check('address').custom(isEthereumAddress),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    // Retrieve the grant, validating email in the process.
    const { grantId, address, amount } = req.body
    try {
      const grant = await transferTokens({
        grantId,
        email: req.session.email,
        ip: req.connection.remoteAddress,
        networkId,
        address,
        amount
      })
      res.send(grant.get({ plain: true }))

      const grantedAt = moment(grant.grantedAt).format('YYYY-MM-DD')
      logger.info(
        `${logDate()} ${
          grant.email
        } grant ${grantedAt} transferred ${amount} OGN to ${address}`
      )
    } catch (e) {
      if (e instanceof ReferenceError || e instanceof RangeError) {
        res.status(422).send(e.message)
      } else {
        throw e
      }
    }
  })
)

/**
 * Return the events pertaining to the user.
 */
app.get(
  '/api/events',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    logger.debug('/api/events', req.session.email)
    // Perform an LEFT OUTER JOIN between Events and Grants. Neither SQLite nor
    // Sequelize supports this natively.
    const events = await Event.findAll({
      where: { email: req.session.email },
      order: [['id', 'DESC']]
    })
    const grantIds = Array.from(new Set(events.map(e => e.grantId)))
    const grants = await Grant.findAll({
      where: {
        id: { [Op.in]: grantIds },
        email: req.session.email // extra safeguard
      }
    })
    const grantsById = grants.reduce((map, grant) => {
      map[grant.id] = grant.get({ plain: true })
      return map
    }, {})
    // Populate each returned event with the corresponding grant.
    const returnedEvents = events.map(e => ({
      ...e.get({ plain: true }),
      grant: e.grantId ? grantsById[e.grantId] : null
    }))
    logger.debug(`Returned ${returnedEvents.length} events`)
    res.json(returnedEvents)
  })
)

app.post(
  '/api/send_email_code',
  asyncMiddleware(async (req, res) => {
    logger.debug('/api/send_email_code called, body=', req.body)
    const email = req.body.email

    // Check the user exists before sending an email code.
    const user = await User.findOne({ where: { email } })
    if (user) {
      // TODO: send email code here

      logger.info(`${logDate()} Sent email code to ${email}`)
    }

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(email))
  })
)

app.post(
  '/api/verify_email_code',
  passport.authenticate('local'),
  (req, res) => {
    logger.debug('/api/verify_email_code called')
    if (!req.user) {
      res.status(401)
      return res.send('User not authorized')
    }

    // Save the authenticated user in the session cookie.
    // FRANCK: DO WE REALLY NEED THIS OR COULD WE RELY ON PASSPORT req.user ????
    req.session.email = req.user.email
    req.session.save(err => {
      if (err) {
        logger.error('ERROR saving session:', err)
      }
    })
    
    logger.info(`${logDate()} ${req.user.email} verified email`)

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ email: req.user.email, otpReady: Boolean(req.user.otpKey) }))
  }
)

/**
  Returns data for setting up TOTP.
 */
app.post(
  '/api/totp_setup',
  ensureEmailVerified, // User must have verified their email first.
  asyncMiddleware(async (req, res) => {
    logger.debug('/api/totp_setup called')
    if (req.user.otpKey) {
      // Two-factor auth has already been setup. Do not allow to reset it.
      res.status(403)
      return res.send('TOTP already setup.')
    }

    // TOTP  not setup yet. Generate a key and save it in the DB.
    const key = Web3.utils.randomHex(10).slice(2)
    const encodedKey = base32.encode(key).toString()
    logger.debug('OTP KEY=', key)
    const encryptedKey = encrypt(key)
    logger.debug('Encrypted OTP KEY=', encryptedKey)
    await req.user.update({ otpKey: encryptedKey })

    // Generate QR code for scanning into Google Authenticator
    // Reference: https://code.google.com/p/google-authenticator/wiki/KeyUriFormat
    const otpUrl = `otpauth://totp/${req.user.email}?secret=${encodedKey}&period=30&issuer=OriginProtocol`
    const otpQrUrl = 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=' + encodeURIComponent(otpUrl)

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ email: req.user.email, otpKey: encodedKey, otpQrUrl }))
  })
)

/**
 * Verifies a TOTP code.
 */
app.post(
  '/api/verify_totp',
  ensureEmailVerified, // User must have verified their email first.
  passport.authenticate('totp'),
  (req, res) => {
    logger.debug('/api/verify_totp called')

    // Log the successfull login.
    Event.create({
      email: req.user.email,
      ip: req.connection.remoteAddress,
      grantId: null,
      action: LOGIN,
      data: JSON.stringify({})
    })

    // Save in the session that the user successfully authed with TOTP.
    req.session.twoFA = 'totp'
    req.session.save(err => {
      if (err) {
        logger.error('ERROR saving session:', err)
      }
    })

    // TODO: is that the right thing to return ?
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ email: req.user.email }))
  }
)

// Destroys the user's session cookie.
app.post('/api/logout', ensureLoggedIn, (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        logger.error('ERROR destroying session:', err)
      }
    })
  }
  res.send('logged out')
})

createProviders([networkId]) // Ensure web3 credentials are set up
app.listen(port, () => {
  logger.info(`Listening on port ${port}`)
})
