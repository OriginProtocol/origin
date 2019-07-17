'use strict'

const passport = require('passport')
//const GoogleTokenStrategy = require('passport-google-token').Strategy
const LocalStrategy = require('passport-local').Strategy
const TotpStrategy = require('passport-totp').Strategy
const logger = require('./logger')
const { decrypt } = require('./lib/crypto')
const { User } = require('./models')


// TODO: extract this into a config module
const clientSecret = process.env['GOOGLE_CLIENT_SECRET']
if (!clientSecret) {
  logger.error('Please set GOOGLE_CLIENT_SECRET to the OAuth secret')
  process.exit(1)
}

const clientId = process.env['GOOGLE_CLIENT_ID']
if (!clientId) {
  logger.error('Please set GOOGLE_CLIENT_ID to the OAuth client ID')
  process.exit(1)
}

module.exports = function() {
  const config = {
    clientID: clientId,
    clientSecret: clientSecret
  }

  /*
  passport.use(
    new GoogleTokenStrategy(config, (accessToken, _, profile, done) => {
      return done(null, {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        token: accessToken
      })
    })
  )
  */

  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'code',
      session: false
    },
    async function(email, code, done) {
      try {
        const user = User.findOne({ where: { email } })
        if (!user) {
          // No user with that email found.
          return done(null, false)
        }
        // TODO: Read code from DB ?
        if (code !== 'EMAIL_CODE') {
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
      // Return the TOTP key and period.
      const otpKey = decrypt(user.otpKey)
      const period = 30
      // TODO: in case of error call done(err)
      return done(null, otpKey, period)
    })
  )
}
