'use strict'

const Logger = require('logplease')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')

module.exports = Logger.create('notifications', { showTimestamp: false })
