'use strict'

const Logger = require('logplease')
Logger.setLogLevel('DEBUG')
module.exports = Logger.create('origin-bridge', {
  color: Logger.Colors.Orange
})
