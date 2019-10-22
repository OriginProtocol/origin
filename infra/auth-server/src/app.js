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

app.listen(5200, () => {
  logger.info('Origin Auth server running on port 5200...')
})

module.exports = app
