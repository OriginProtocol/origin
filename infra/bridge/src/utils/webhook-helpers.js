'use strict'

const { GrowthCampaign } = require('@origin/growth-campaign/src/models')
const {
  GrowthCampaignRewardStatuses
} = require('@origin/growth-campaign/src/enums')

const EventValidators = require('../utils/event-validators')

const { decodeHTML } = require('./index')

const logger = require('../logger')
const crypto = require('crypto')

let validContents = []

/**
 * Populates the `validContents` array with contents that can be rewarded
 */
module.exports.populateValidContents = async () => {
  if (validContents.length) {
    return
  }

  const campaign = await GrowthCampaign.findOne({
    where: {
      rewardStatus: GrowthCampaignRewardStatuses.NotReady
    },
    order: [['createdAt', 'ASC']]
  })

  if (!campaign) {
    logger.error('No active campaign found')
    return false
  }

  try {
    const rules = JSON.parse(campaign.rules)
    const contentIds = Object.keys(rules.content || [])
    validContents = contentIds.map(contentId => rules.content[contentId])
  } catch (err) {
    logger.error('Failed to populate valid contents', err)
  }
}

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
    logger.error(`Error when trying to parse event: ${socialNetwork}`, args)
    return false
  }

  return validator(args)
}

/**
 * Returns the untranslated text content, for the given one
 */
module.exports.getUntranslatedContent = translatedContent => {
  const defaultTextMatch = validContents.find(
    content => content.post.tweet.default.trim() === translatedContent.trim()
  )

  if (defaultTextMatch) {
    // The given text is already untranslated
    return translatedContent
  }

  const contentObj = validContents.find(content => {
    // Check if it is translated text
    const translation = content.post.tweet.translations.find(
      content => content.text.trim() === translatedContent.trim()
    )

    if (translation) {
      return true
    }

    return false
  })

  return contentObj ? contentObj.post.tweet.default.trim() : translatedContent
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
 * Checks if the event is of content that can be rewarded
 * @param {Object} args.event
 * @returns true if valid and can be rewarded, false otherwise
 */
module.exports.validateShareableContent = ({ event, type }) => {
  let sharedContent = getEventContent({ event, type })

  if (!sharedContent) {
    return false
  }

  sharedContent = sharedContent.trim()

  const entities = (event.extended_tweet || event).entities
  const expandedUrls = entities.urls.map(entityUrl => entityUrl.expanded_url)

  return expandedUrls.some(contentLink => {
    // Find all content that has the link
    const content = validContents.find(
      content => content.link.toLowerCase() === contentLink.toLowerCase()
    )

    if (!content) {
      // No rewardable content has that link
      return false
    }

    if (content.post.tweet.default.trim() === sharedContent) {
      // User has shared the untranslated text
      return true
    }

    // Check if it is translated text
    const translation = content.post.tweet.translations.find(
      content => content.text.trim() === sharedContent
    )

    if (translation) {
      return translation.text.trim() === sharedContent
    }

    return false
  })
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
