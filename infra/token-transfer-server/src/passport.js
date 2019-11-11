'use strict'

const passport = require('passport')
const BearerStrategy = require('passport-http-bearer').Strategy
const logger = require('./logger')
const jwt = require('jsonwebtoken')

const { User } = require('./models')
const { encryptionSecret } = require('./config')

module.exports = function() {
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(async function(id, done) {
    logger.debug('Deserializing user with ID', id)
    try {
      const user = await User.findOne({ where: { id } })
      if (!user) {
        return done(null, false)
      }
      return done(null, user)
    } catch (e) {
      return done(e)
    }
  })

  passport.use(
    new BearerStrategy(async (token, done) => {
      logger.debug('Passport bearer strategy called')
      let decodedToken
      try {
        decodedToken = jwt.verify(token, encryptionSecret)
      } catch (error) {
        logger.error('Could not decode token', error)
        return done(null, false)
      }

      try {
        const user = await User.findOne({
          where: { email: decodedToken.email }
        })
        if (!user) {
          // No user with that email found.
          logger.warn(
            `Passport authentication attempted for invalid user ${decodedToken.email}`
          )
          return done(null, false)
        }
        // All good
        return done(null, user)
      } catch (e) {
        // Something went wrong. Return an error.
        logger.error(e)
        return done(e)
      }
    })
  )
}
