'use strict'

const Logger = require('logplease')
Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
module.exports = Logger.create('origin-auth-utils', {
  color: Logger.Colors.Yellow,
  showTimestamp: false
})
