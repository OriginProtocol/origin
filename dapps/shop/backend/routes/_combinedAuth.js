const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')
const BearerStrategy = require('passport-http-bearer')
const bcrypt = require('bcrypt')
const { Sellers, Shops } = require('../data/db')
const { PASSWORD_SALT_ROUNDS, IS_PROD } = require('../utils/const')

const AUTH_FAILED = new Error('Authentication failed')

async function createSalt() {
  return await bcrypt.genSalt(PASSWORD_SALT_ROUNDS)
}

async function hashPassword(salt, password) {
  return await bcrypt.hash(password, salt)
}

async function checkPassword(password, passwordHash) {
  return await bcrypt.compare(password, passwordHash)
}

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})

passport.use(
  new BearerStrategy(async function(token, done) {
    //console.log(`passport auth token: '${token}'`)
    let shop
    try {
      shop = await Shops.findOne({
        where: {
          auth_token: token
        },
        raw: true
      })
      if (!shop) {
        return done(null, false)
      }
    } catch (err) {
      return done(IS_PROD ? AUTH_FAILED : err)
    }
    return done(null, shop, { scope: 'all' })
  })
)

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, cb) => {
      try {
        const seller = await Sellers.findOne({
          where: {
            email
          },
          raw: true
        })

        if (!seller) {
          console.log(`User ${email} not found`)
          return cb(null, false, { message: 'Login failed.' })
        }

        const comparison = await checkPassword(password, seller.password)
        if (!comparison) {
          return cb(null, false, { message: 'Login failed.' })
        }

        // Remove sensitive data
        delete seller.password

        return cb(null, seller, {
          message: 'Logged In Successfully'
        })
      } catch (err) {
        return cb(err)
      }
    }
  )
)

function createLoginHandler(req, res, next) {
  return (err, user) => {
    if (err) {
      console.error(err)
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }
    req.logIn(user, err => {
      if (err) return next(err)
      return next()
    })
  }
}

function authenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return passport.authenticate(
    'bearer',
    { session: false },
    createLoginHandler(req, res, next)
  )(req, res, next)
}

function authenticatedAsSeller(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).json({
    success: false,
    message: 'Unauthorized'
  })
}

function AuthSeller(req, res, next) {
  return passport.authenticate(
    'local',
    { session: true },
    createLoginHandler(req, res, next)
  )(req, res, next)
}

function AuthKey(req, res, next) {
  return passport.authenticate(
    'bearer',
    { session: false },
    createLoginHandler(req, res, next)
  )(req, res, next)
}

module.exports = {
  createSalt,
  hashPassword,
  passport,
  AuthKey,
  AuthSeller,
  authenticated,
  authenticatedAsSeller
}
