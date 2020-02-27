require('dotenv').config()

const { NETWORK } = require('../utils/const')
const sqlite = `sqlite:${__dirname}/net_${NETWORK}.db`
const url = process.env.DATABASE_URL || sqlite

module.exports = {
  development: { url, logging: false, define: { underscored: true } },
  test: { url, logging: false, define: { underscored: true } },
  production: { url, logging: false, define: { underscored: true } }
}
