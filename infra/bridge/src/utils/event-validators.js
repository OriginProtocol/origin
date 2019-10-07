'use strict'

const logger = require('../logger')

/**
 * Returns true if event is valid, false otherwise
 */
function validateTwitterEvent({ type }) {
  if (type === 'FOLLOW' || type === 'SHARE') {
    return true
  }

  logger.debug(`Unknown telegram event type ${type}`)

  return false
}

/**
 * Returns true if it is follow event and not a bot, false otherwise
 */
function validateTelegramEvent({ type, event }) {
  if (type === 'FOLLOW') {
    // Ignore events from bots
    return event.is_bot === false
  }

  logger.debug(`Unknown telegram event type ${type}, ${event}`)
  return false
}

module.exports = {
  TWITTER: validateTwitterEvent,
  TELEGRAM: validateTelegramEvent
}
