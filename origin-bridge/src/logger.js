'use strict'

const Logger = require('logplease')
Logger.setLogLevel('INFO')
module.exports = Logger.create('origin-bridge', {
  color: Logger.Colors.Yellow,
  showTimestamp: false
})
