'use strict'

const logger = require('../logger')

const {
  validateShareableContent,
  populateValidContents
} = require('./webhook-helpers')

/**
 * Returns true if event is valid, false otherwise
 */
async function validateTwitterEvent({ type, event }) {
  if (type === 'FOLLOW') {
    return true
  }

  if (type === 'SHARE') {
    await populateValidContents()

    return validateShareableContent({ event, type })
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
