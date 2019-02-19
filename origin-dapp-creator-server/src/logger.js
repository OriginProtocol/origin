'use strict'

const Logger = require('logplease')
Logger.setLogLevel('DEBUG')
module.exports = Logger.create('origin-dapp-creator-server', {
  color: Logger.Colors.Green
})
