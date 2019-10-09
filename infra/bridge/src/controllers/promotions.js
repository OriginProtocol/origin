'use strict'

const express = require('express')
const router = express.Router()

const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const {
  GrowthEventTypes,
  GrowthEventStatuses
} = require('@origin/growth-event/src/enums')

const { hashContent } = require('../utils/webhook-helpers')

const { verifyPromotions } = require('../utils/validation')

const PromotionEventToGrowthEvent = {
  TWITTER: {
    FOLLOW: GrowthEventTypes.FollowedOnTwitter,
    SHARE: GrowthEventTypes.SharedOnTwitter
  },
  TELEGRAM: {
    FOLLOW: GrowthEventTypes.FollowedOnTelegram
  }
}

router.get('/verify', verifyPromotions, async (req, res) => {
  const { socialNetwork, type, identity, identityProxy, content } = req.query
  const contentHash = content ? hashContent(content) : null

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

  return res.status(200).send({
    success: true,
    verified
  })
})

module.exports = router
