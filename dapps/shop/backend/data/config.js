require('dotenv').config()

const sqlite = `sqlite:${__dirname}/dshop.db`
const url = process.env.DATABASE_URL || sqlite
console.log("DB URL=", url)

module.exports = {
  development: { url, logging: false, define: { underscored: true } },
  test: { url, logging: false, define: { underscored: true } },
  production: { url, logging: false, define: { underscored: true } }
}
