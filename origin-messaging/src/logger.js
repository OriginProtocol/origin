'use strict'

const Logger = require('logplease')
Logger.setLogLevel('DEBUG')
module.exports = Logger.create('origin-messaging', {
  color: Logger.Colors.Yellow
})
