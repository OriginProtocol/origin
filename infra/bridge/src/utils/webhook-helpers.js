'use strict'

const EventValidators = require('../utils/event-validators')

const { decodeHTML } = require('./index')

/**
 * @returns user profile data from the event
 */
module.exports.getUserProfileFromEvent = ({ event, socialNetwork, type }) => {
  switch (socialNetwork) {
    case 'TWITTER':
      return type === 'FOLLOW' ? event.target : event.user

    case 'TELEGRAM':
      return event
  }

  // TODO: As of now, only twitter and telegram are supported
  logger.error(`Trying to parse event of unknown network: ${socialNetwork}`)
  return null
}

/**
 * @param socialNetwork Could be one of ['TWITTER', 'TELEGRAM']
 * @returns true if event is valid, false otherwise
 */
module.exports.isEventValid = ({ socialNetwork, ...args }) => {
  const validator = EventValidators[socialNetwork.toUpperCase()]

  if (!validator) {
    logger.error(`Trying to parse event of unknown network: ${socialNetwork}`)
    // TODO: As of now, only twitter is supported
    return false
  }

  return validator(args)
}

/**
 * Resolves shortened URLs and returns the tweet content for `SHARE` type
 * @returns the content from the event
 */
module.exports.getEventContent = ({ type, event }) => {
  if (type !== 'SHARE') {
    return null
  }

  // Note: `event.text` is truncated to 140chars, use `event.extended_tweet.full_text`, if it exists, to get whole tweet content
  // Clone to avoid mutation
  let encodedContent = JSON.parse(
    JSON.stringify(
      event.extended_tweet ? event.extended_tweet.full_text : event.text
    )
  )

  logger.debug('content from network:', encodedContent)

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

  logger.debug('resolved content:', decodedContent)

  return decodedContent
}

/**
 * Hashes content for verification of the user's post.
 *
 * Important: Make sure to keep this hash function in sync with
 * the one used in the growth engine rules.
 * See infra/growth/resources/rules.js
 *
 * @param text
 * @returns {String} Hash of the text, hexadecimal encoded.
 * @private
 */
module.exports.hashContent = text => {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex')
}
