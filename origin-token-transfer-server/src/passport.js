'use strict'

const passport = require('passport')
const GoogleTokenStrategy = require('passport-google-token').Strategy

// TODO: extract this into a config module
const clientSecret = process.env['GOOGLE_CLIENT_SECRET']
if (!clientSecret) {
  console.error('Please set GOOGLE_CLIENT_SECRET to the OAuth secret')
  process.exit(1)
}

const clientId = process.env['GOOGLE_CLIENT_ID']
if (!clientId) {
  console.error('Please set GOOGLE_CLIENT_ID to the OAuth client ID')
  process.exit(1)
}

module.exports = function() {
  const config = {
    clientID: clientId,
    clientSecret: clientSecret
  }

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
}
