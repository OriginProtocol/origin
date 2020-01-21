require('dotenv').config()
const randomstring = require('randomstring')

const {
  NODE_ENV,
  SESSION_SECRET = randomstring.generate(),
  SERVER_HOSTNAME = 'localhost'
} = process.env

const IS_PROD = NODE_ENV === 'production'
const PASSWORD_SALT_ROUNDS = 10

module.exports = {
  NODE_ENV,
  IS_PROD,
  SESSION_SECRET,
  SERVER_HOSTNAME,
  PASSWORD_SALT_ROUNDS
}
