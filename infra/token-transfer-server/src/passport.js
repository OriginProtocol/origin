'use strict'

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const TotpStrategy = require('passport-totp').Strategy
const logger = require('./logger')
const { decrypt } = require('./lib/crypto')
const { User } = require('./models')


module.exports = function() {

  passport.serializeUser(function(user, done) {
    logger.debug('Serializing user with email', user.email)
    done(null, user.email)
  })

  passport.deserializeUser(async function(id, done) {
    logger.debug('Deserializing user with id', id)
    try {
      const user = await User.findOne({ where: { email: id } })
      if (!user) {
        return done(null, false)
      }
      return done(null, user)
    } catch (e) {
      return done(e)
    }
  })

  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'code',
      session: false
    },
    async function(email, code, done) {
      logger.debug('Passport local strategy called.', email, code)
      try {
        const user = await User.findOne({ where: { email } })
        if (!user) {
          // No user with that email found.
          return done(null, false)
        }
        // TODO: Read code from DB ?
        if (code !== 'CODE') {
          // Code does not match.
          return done(null, false)
        }
        // Email and code match. All good !
        return done(null, user)
      } catch (e) {
        // Something went wrong. Return an error.
        return done(e)
      }
    }
  ))

  passport.use(
    new TotpStrategy( (user, done) => {
      logger.debug('Passport TOTP strategy called for', user.email)
      // Supply key and period to done callback for verification.
      const otpKey = decrypt(user.otpKey)
      const period = 30
      return done(null, otpKey, period)
    })
  )
}
