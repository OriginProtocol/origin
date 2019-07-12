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
const { bundle } = require('./prom')
const logger = require('./logger')
const Relayer = require('./relayer')

const app = express()
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bundle)

// networkId: 1=Mainnet, 4=Rinkeby, etc...
const networkId = parseInt(process.env.NETWORK_ID)
if (isNaN(networkId)) {
  throw new Error(`NETWORK_ID invalid or not specified.`)
}
const relayer = new Relayer(networkId)
logger.info(`Using networkId ${networkId}`)

// Register the /relay route for relaying transactions.
app.post('/relay', function(req, res) {
  try {
    relayer.relay(req, res)
  } catch (e) {
    res.send({ success: false })
  }
})

const port = process.env.PORT || 5100
app.listen(port, () => {
  logger.info(`Relayer listening on port ${port}...`)
})

module.exports = app
