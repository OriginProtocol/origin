require('dotenv').config()
const passport = require('passport')
const BearerStrategy = require('passport-http-bearer')
const { Shop } = require('../data/db')

const AUTH_FAILED = new Error('Authentication failed')
const isProd = process.env.NODE_ENV !== 'production'

passport.use(
  new BearerStrategy(async function(token, done) {
    console.log(`passport auth token: '${token}'`)
    let shop
    try {
      shop = await Shop.findOne({
        where: {
          auth_token: token
        }
      })
      if (!shop) {
        return done(null, false)
      }
    } catch (err) {
      return done(isProd ? AUTH_FAILED : err)
    }
    return done(null, shop, { scope: 'all' })
  })
)

module.exports = passport.authenticate('bearer', { session: false })
