'use strict'

const logger = require('../logger')
const { decodeHTML } = require('./index')

/**
 * Returns decodedContent (for SHARE) or true (for FOLLOW) if event is what you are looking for, false otherwise
 */
function validateTwitterEvent({ type, event, content }) {
  if (type === 'FOLLOW') {
    return true
  }

  // Note: `event.text` is truncated to 140chars, use `event.extended_tweet.full_text`, if it exists, to get whole tweet content
  // Clone to avoid mutation
  let encodedContent = JSON.parse(
    JSON.stringify(
      event.extended_tweet ? event.extended_tweet.full_text : event.text
    )
  )

  // IMPORTANT: Twitter shortens and replaces URLs
  // we have revert that back to get the original content and to get the hash
  // IMPORTANT: Twitter prepends 'http://' if it idenitifies a text as URL
  // It may result in a different content than expected, So always prepend URLs with `http://` in rule configs.

  const entities = (event.extended_tweet || event).entities
  entities.urls.forEach(entity => {
    encodedContent = encodedContent.replace(entity.url, entity.expanded_url)
  })

  // Invalid if tweet content is not same as expected
  // Note: Twitter sends HTML encoded contents
  const decodedContent = decodeHTML(encodedContent)

  logger.debug('encoded content:', encodedContent)
  logger.debug('decoded content:', decodedContent)
  logger.debug('expected content:', content)

  return decodedContent === content ? decodedContent : false
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
