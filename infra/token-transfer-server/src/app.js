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
const passport = require('passport')
const path = require('path')
const session = require('express-session')
require('./passport')()
const SQLiteStore = require('connect-sqlite3')(session)
const { Op } = require('sequelize')
const Web3 = require('web3')

const { createProvider } = require('@origin/token/src/config')
const { transferTokens } = require('./lib/transfer')
const { Event, Grant } = require('./models')

const {
  sendEmailCode,
  verifyEmailCode,
  setupTotp,
  verifyTotp,
  logout
} = require('./login')

// Configuration
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  logger.error('SESSION_SECRET must be set through EnvKey or manually')
  process.exit(1)
}
const port = process.env.PORT || 5000
const networkId = Number.parseInt(process.env.NETWORK_ID) || 999

// Session setup.
const sessionConfig = {
  cookie: { maxAge: 30 * 60 * 1000 }, // 30 min TTL
  resave: false, // Do not force session to get saved if it was not modified by the request.
  saveUninitialized: true,
  secret: sessionSecret,
  store: new SQLiteStore({
    dir: path.resolve(__dirname + '/../data'),
    db: 'sessions.sqlite3'
  })
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sessionConfig.cookie.secure = true // serve secure cookies
}
app.use(session(sessionConfig))

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

/**
 * Middleware to ensure a user is logged in.
 * MUST be called by all routes.
 */
function ensureLoggedIn(req, res, next) {
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
  // User email is verified and user passed 2FA.
  logger.debug('Authentication success')
  res.setHeader('X-Authenticated-Email', req.session.email)
  next()
}

/**
 * MIddleware to ensures a user verified their email.
 */
function ensureEmailVerified(req, res, next) {
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
        `${grant.email} grant ${grantedAt} transferred ${amount} OGN to ${address}`
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

/**
 * Sends a login code by email.
 */
app.post('/api/send_email_code', asyncMiddleware(sendEmailCode))

/**
 * Verifies a login code sent by email.
 */
app.post(
  '/api/verify_email_code',
  passport.authenticate('local'),
  verifyEmailCode
)

/**
  Returns data for setting up TOTP.
 */
app.post(
  '/api/setup_totp',
  ensureEmailVerified, // User must have verified their email first.
  asyncMiddleware(setupTotp)
)

/**
 * Verifies a TOTP code.
 */
app.post(
  '/api/verify_totp',
  ensureEmailVerified, // User must have verified their email first.
  passport.authenticate('totp'),
  asyncMiddleware(verifyTotp)
)

/**
 * Log out user by destroying their session cookie
 */
app.post('/api/logout', ensureLoggedIn, logout)

createProvider(networkId) // Ensure web3 credentials are set up
app.listen(port, () => {
  logger.info(`Listening on port ${port}`)
})
