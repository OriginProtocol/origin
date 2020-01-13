'use strict'

const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('./logger')

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
}

app.use(express.json())

app.use(cors({ origin: true, credentials: true }))

app.use(require('./controllers'))

// Catch all
app.all('*', function(req, res) {
  res.status(404)
    .send({
      errors: ['The page you are looking for does not exist']
    })
})

app.listen(5200, () => {
  logger.info('Origin Auth server running on port 5200...')
})

module.exports = app
