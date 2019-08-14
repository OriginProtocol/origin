'use strict'

const Logger = require('logplease')

const logLevel = process.env.LOG_LEVEL || 'INFO'

Logger.setLogLevel(logLevel)

module.exports = Logger.create('t3', { showTimestamp: false })
