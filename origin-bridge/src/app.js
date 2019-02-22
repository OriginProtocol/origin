const express = require('express')
const app = express()
const session = require('express-session')
const bodyParser = require('body-parser')

app.use(express.json())

const sess = {
  name: process.env.COOKIE_NAME || 'origin-bridge',
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}
if (process.env.NODE_ENV == 'production') {
  sess.cookie.secure = true
}
app.use(session(sess))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(require('./controllers'))

app.listen(5000, () => {
  console.log('Origin-bridge listening on port 5000...')
})

module.exports = app
