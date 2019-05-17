'use strict'

require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const promBundle = require('express-prom-bundle')
const { relayTx } = require('./relayer')

// For Prometheus metrics collection.
const bundle = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})

const app = express()
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bundle)

// Register the /relay route for relaying transactions.
app.post('/relay', relayTx)

const port = process.env.PORT || 5100
app.listen(port, () => {
  console.log(`Relayer listening on port ${port}...`)
})

module.exports = app
