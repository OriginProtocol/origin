const logger = require('./logger')
const express = require('express')
const promBundle = require('express-prom-bundle')

// Create an express server for Prometheus to scrape metrics
const app = express()
const bundle = promBundle({
  includeMethod: true,
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})
app.use(bundle)

// Create metrics.
const blockGauge = new bundle.promClient.Gauge({
  name: 'event_listener_last_block',
  help: 'The last block processed by the event listener'
})

const errorCounter = new bundle.promClient.Counter({
  name: 'event_listener_handler_error',
  help: 'Number of errors from the event listener handler '
})

const port = 9499

// Start express server for serving metrics
app.listen({ port: port }, () => {
  logger.info(`Serving Prometheus metrics on port ${port}`)
})

module.exports = { blockGauge, errorCounter }
