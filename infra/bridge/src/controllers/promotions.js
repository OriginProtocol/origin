'use strict'

const express = require('express')
const router = express.Router()

const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const {
  GrowthEventTypes,
  GrowthEventStatuses
} = require('@origin/growth-event/src/enums')

const {
  hashContent,
  getUntranslatedContent
} = require('../utils/webhook-helpers')

const { verifyPromotions } = require('../utils/validation')

const logger = require('../logger')

const PromotionEventToGrowthEvent = {
  TWITTER: {
    FOLLOW: GrowthEventTypes.FollowedOnTwitter,
    SHARE: GrowthEventTypes.SharedOnTwitter
  },
  TELEGRAM: {
    FOLLOW: GrowthEventTypes.FollowedOnTelegram
  }
}

/**
 * Checks and returns the verification status
 * @param {String} req.query.socialNetwork Can be one of (TWITTER, TELEGRAM)
 * @param {String} req.query.type Type of promotion activity. Can be one of (SHARE, FOLLOW)
 * @param {String} req.query.identity The eth address of the user
 * @param {String} req.query.identityProxy The proxy address of the user, if any
 * @param {String} req.query.content The tweet content to check the status of. Only needed for `SHARE` type
 * @returns {Boolean} result.success - true, if HTTP request is successful.
 * @returns {Boolean} result.verified - true, if the promotion activity has been verified; false otherwise.
 */
router.get('/verify', verifyPromotions, async (req, res) => {
  const { socialNetwork, type, identity, identityProxy, content } = req.query
  const untranslatedContent = content ? getUntranslatedContent(content) : null
  const contentHash = content ? hashContent(untranslatedContent) : null

  logger.debug(
    `Checking status of ${socialNetwork} ${type} event for ${identity}`,
    `\nContent: ${content}`,
    `\nUntranslatedContent: ${untranslatedContent}`,
    `\nContentHash: ${contentHash}`
  )

  const addresses = []
  if (identity) addresses.push(identity)
  if (identityProxy) addresses.push(identityProxy)

  const events = await GrowthEvent.findAll(
    null,
    addresses,
    PromotionEventToGrowthEvent[socialNetwork.toUpperCase()][
      type.toUpperCase()
    ],
    contentHash
  )

  const verified = events.some(
    event =>
      event.status === GrowthEventStatuses.Logged ||
      GrowthEventStatuses.Verified
  )

  logger.debug(`Found ${events.length} matching Growth events`)
  logger.debug('Verification Status', verified)

  return res.status(200).send({
    success: true,
    verified
  })
})

module.exports = router
