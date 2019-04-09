const express = require('express')
const promBundle = require('express-prom-bundle')

// Create an express server for Prometheus to scrape metrics
const metricsServer = express()
const bundle = promBundle({
  includeMethod: true,
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})
metricsServer.use(bundle)

// Create metrics.
const blockGauge = new bundle.promClient.Gauge({
  name: 'event_listener_last_block',
  help: 'The last block processed by the event listener'
})

const errorCounter = new bundle.promClient.Counter({
  name: 'event_listener_handler_error',
  help: 'Number of errors from the event listener handler '
})

module.exports = { blockGauge, errorCounter, metricsServer }
