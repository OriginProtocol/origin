require('envkey')
const express = require('express')
const app = express()
const { check, validationResult } = require('express-validator/check')
const cors = require('cors')
const bodyParser = require('body-parser')
const port = process.env.PORT || 5000
const passport = require('passport')
const session = require('express-session')
require('./passport')()
const SQLiteStore = require('connect-sqlite3')(session)

const { Event, Grant, sequelize  } = require('./models')
const { Op } = require('sequelize')
const { GRANT_TRANSFER, LOGIN } = require('./constants/events')

const Token = require('origin-faucet/lib/token')
const { createProviders } = require('origin-faucet/lib/config')

const Web3 = require('web3')

// Read secrets from EnvKey.
const sessionSecret = process.env['SESSION_SECRET']
if (!sessionSecret) {
  console.error('SESSION_SECRET must be set through EnvKey or manually')
  process.exit(1)
}

// Setup sessions.
app.use(session({
  cookie: { maxAge: 60 * 60 * 1000 },
  resave: false,
  secure: false,
  saveUninitialized: true,
  secret: sessionSecret,
  store: new SQLiteStore({
    dir: '../data',
    db: 'sessions.sqlite3'
  })
}))

// Expose extra headers.
app.use(cors({
  exposedHeaders: ['X-Authenticated-Email'],
}))

// Parse request bodies.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/**
 * Allows use of async functions for an Express route.
 */
const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next)
  }

/**
 * Middleware for requiring a session. Injects the X-Authenticated-Email header
 * with the authenticated email for the session.
 */
function withSession(req, res, next) {
  if (!req.session.email) {
    res.status(401)
    return res.send('This action requires Google login.')
  }
  res.setHeader('X-Authenticated-Email', req.session.email)
  next()
}

/**
 * Returns grants for the authenticated user.
 */
app.get('/api/grants', withSession, asyncMiddleware(async (req, res) => {
  const grants = await Grant.findAll({ where: { email: req.session.email } })
  const augmentedGrants = grants.map((grant) => ({
    ...grant.get({ plain: true }),
    nextVest: grant.nextVesting()
  }))
  res.json(augmentedGrants)
}))

const isEthereumAddress = value => {
  if (!Web3.utils.isAddress(value)) {
    throw new Error('Address is not a valid Ethereum address')
  }
  return true
}

/**
 * Transfers tokens from hot wallet to address of user's choosing.
 */
app.post('/api/transfer', [
    check('grantId').isInt(),
    check('amount').isInt(),
    check('address').custom(isEthereumAddress),
    withSession
  ],
  asyncMiddleware(async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

  const grantId = req.body.grantId
  const amount = Number.parseInt(req.body.amount)
  const address = req.body.address

  // Retrieve the grant, validating email in the process.
  const grant = await Grant.findOne({ where: {
    id: grantId,
    email: req.session.email
  } })
  if (!grant) {
    return res.status(422).send('Could not find specified grant')
  }

  // Ensure that the grant has sufficient transferrable tokens.
  const available = grant.vested - grant.transferred
  if (amount > available) {
    return res
      .status(422)
      .send(`Amount of ${amount} OGN exceeds the ${available} OGN available for the grant`)
  }

  const networkId = 999 // TODO: replace with command-line option
  const config = {
    providers: createProviders([ networkId ])
  }
  const token = new Token(config)
  const supplier = await token.defaultAccount(networkId)
  await token.credit(networkId, address, amount)

  // Record new state in the database.
  const txn = await sequelize.transaction()
  try {
    await grant.increment(['transferred'], { by: amount })
    await grant.save()
    await Event.create({
      email: req.session.email,
      ip: req.connection.remoteAddress,
      grantId: grantId,
      action: GRANT_TRANSFER,
      data: JSON.stringify({
        amount: req.body.amount,
        from: supplier,
        to: req.body.address
      })
    })
    await txn.commit()
  } catch(e) {
    await txn.rollback()
    throw(e)
  }

  res.send(grant.get({ plain: true }))
}))

// TODO: review this for security
app.post(
  '/api/auth_google',
  passport.authenticate('google-token', {session: false}),
  (req, res) => {
    if (!req.user) {
      res.status(401)
      return res.send('User not authorized')
    }

    // Save the authenticated user in the session cookie.
    req.auth = {
      id: req.user.id
    }
    req.session.email = req.user.email
    req.session.save(err => {
      if (err) {
        console.error('ERROR saving session:', err)
      }
    })

    // Log the login.
    Event.create({
      email: req.user.email,
      ip: req.connection.remoteAddress,
      grantId: null,
      action: LOGIN,
      data: JSON.stringify({})
    })

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(req.user))
  }
)

/**
 * Return the events pertaining to the user.
 */
app.get('/api/events', withSession, asyncMiddleware(async (req, res) => {
  // Perform an LEFT OUTER JOIN between Events and Grants. Neither SQLite nor
  // Sequelize supports this natively.
  const events = await Event.findAll({
    where: { email: req.session.email },
    order: [ ['id', 'DESC'] ]
  })
  const grantIds = Array.from(new Set(events.map(e => e.grantId)))
  const grants = await Grant.findAll({
    where: {
      id: { [Op.in]: grantIds },
      email: req.session.email  // extra safeguard
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
  res.json(returnedEvents)
}))

// Destroys the user's session cookie.
app.post('/api/logout', withSession, (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('ERROR destroying session:', err)
      }
    })
  }
  res.send('logged out')
})

app.listen(port, () => console.log(`Listening on port ${port}`))

