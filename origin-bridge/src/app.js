'use strict'

const express = require('express')
const app = express()
const cors = require('cors')
const session = require('express-session')
const bodyParser = require('body-parser')

const db = require('./models')
// Initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const sessionStore = new SequelizeStore({
  db: db.sequelize
})

const sess = {
  store: sessionStore,
  name: process.env.COOKIE_NAME || 'origin-bridge',
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}

// Ensures that the session table is created/synced so no separate migration is
// needed
sessionStore.sync()

if (process.env.NODE_ENV == 'production') {
  sess.cookie.secure = true
}

app.use(session(sess))
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(require('./controllers'))

app.listen(5000, () => {
  console.log('Origin-bridge listening on port 5000...')
})

module.exports = app
