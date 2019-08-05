'use strict'

const Logger = require('logplease')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')

function createLogger(options) {
  return Logger.create('event-listener', {
    showTimestamp: false,
    ...options
  })
}

module.exports = {
  createLogger,
  Logger
}
