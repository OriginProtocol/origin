'use strict'

const express = require('express')
const router = express.Router()
const querystring = require('querystring')
const crypto = require('crypto')
const constants = require('../../constants')
const logger = require('../../logger')
const { getTwitterWebhookConsumerSecret } = require('../../utils/hooks')

const bodyParser = require('body-parser')

const {
  getTwitterOAuthRequestToken,
  getTwitterOAuthAccessToken,
  verifyTwitterCredentials
} = require('../../utils/twitter')

const { subscribeToHooks } = require('./../../hooks/twitter')

const growthEventHelper = require('../../utils/growth-event-helpers')

const _chunk = require('lodash/chunk')

/**
 * To generate a authtoken of the target account and subscribe to events
 * Should be run manually once deployed for the first time
 */
router.get('/__init', async (req, res) => {
  let oAuthToken, oAuthTokenSecret
  try {
    const twitterResponse = await getTwitterOAuthRequestToken({
      sid: req.sessionID,
      redirectUrl: '/hooks/twitter/__auth-redirect',
      useWebhookCredentials: true
    })

    oAuthToken = twitterResponse.oAuthToken
    oAuthTokenSecret = twitterResponse.oAuthTokenSecret
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Failed to get Twitter OAuth request token.']
    })
  }

  req.session.oAuthToken = oAuthToken
  req.session.oAuthTokenSecret = oAuthTokenSecret

  const url =
    constants.TWITTER_BASE_AUTH_URL +
    querystring.stringify({ oauth_token: oAuthToken })

  return res.redirect(url)
})

/**
 * Twitter OAuth callback
 * Creates and susbcribes to webhook if everything goes well
 */
router.get('/__auth-redirect', async (req, res) => {
  const session = await req.sessionStore.get(req.query.sid)

  if (!session || !session.oAuthToken || !session.oAuthTokenSecret) {
    return res.status(400).send({
      errors: ['Invalid Twitter oAuth session.']
    })
  }

  let oAuthAccessToken, oAuthAccessTokenSecret
  try {
    const accessToken = await getTwitterOAuthAccessToken(
      session.oAuthToken,
      session.oAuthTokenSecret,
      req.query.oauth_verifier,
      true
    )
    oAuthAccessToken = accessToken.oAuthAccessToken
    oAuthAccessTokenSecret = accessToken.oAuthAccessTokenSecret
  } catch (error) {
    if (error.statusCode == 401) {
      return res.status(401).send({
        errors: ['The oauth-verifier provided is invalid.']
      })
    }
    logger.error(error)
    return res.status(500).send({
      errors: ['Could not get a Twitter access token.']
    })
  }

  let userProfileData
  try {
    userProfileData = await verifyTwitterCredentials(
      oAuthAccessToken,
      oAuthAccessTokenSecret,
      true
    )
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Could not verify Twitter credentials.']
    })
  }

  if (
    userProfileData.screen_name.toLowerCase() !==
    process.env.TWITTER_ORIGINPROTOCOL_USERNAME.toLowerCase()
  ) {
    return res.status(400).send({
      errors: ['Invalid account']
    })
  }

  try {
    await subscribeToHooks(oAuthAccessToken, oAuthAccessTokenSecret)
  } catch (err) {
    logger.error(err)
    return res.status(400).send({
      success: false,
      errors: [
        `Failed to subscribe: ${err.message ? err.message : 'Check logs'}`
      ]
    })
  }

  return res.status(200).send({
    success: true
  })
})

/**
 * Webhook Authorization
 */
router.get('/', (req, res) => {
  res.status(200).send({
    response_token: getCRCToken(req.query.crc_token)
  })
})

/**
 * Returns the hash signature to be used for authorization
 */
function getCRCToken(payload) {
  const hmac = crypto
    .createHmac('sha256', getTwitterWebhookConsumerSecret())
    .update(payload)
    .digest('base64')

  return `sha256=${hmac}`
}

/**
 * Validates the request signature and confirms that
 * it is from Twitter
 * @param {Request} req
 */
function verifyRequestSignature(req) {
  const sign = req.headers['x-twitter-webhooks-signature']
  const token = getCRCToken(req.rawBody)

  // Using `.timingSafeEqual` for comparison to avoid timing attacks
  const valid = crypto.timingSafeEqual(
    Buffer.from(sign, 'utf-8'),
    Buffer.from(token, 'utf-8')
  )

  if (!valid) {
    logger.error('Sign verification mismatch', `received:${sign}, expected:${token}`)
  }

  return valid
}

/**
 * Twitter posts events to this endpoint
 * Should always return 200 with no response
 */
router.post('/', bodyParser.text({ type: '*/*' }), async (req, res) => {
  if (!req.body.follow_events && !req.body.tweet_create_events) {
    // If there are no follow or tweet event, ignore this
    logger.debug('No follow or mention events; ignoring updates.')
    return res.status(200).end()
  }

  if (!verifyRequestSignature(req)) {
    return res.status(403).send({
      errors: ['Unauthorized']
    })
  }

  // Set status code and send back the empty response,
  // so that connection doesn't has to be alive
  res.status(200).end()

  let followCount = 0
  let mentionCount = 0
  let totalFollowEvents = 0
  let totalMentionEvents = 0

  if (req.body.follow_events) {
    // Follow event(s)
    const events = req.body.follow_events
    // Note: Splitting the events into smaller chunks to avoid DB bottleneck
    // if we receive a very large number of events at once
    const chunks = _chunk(events, process.env.CHUNK_COUNT || 100)
    totalFollowEvents = events.length

    for (const chunk of chunks) {
      const promises = chunk.map(event => {
        if (
          event.target.screen_name.toLowerCase() ===
          process.env.TWITTER_ORIGINPROTOCOL_USERNAME.toLowerCase()
        ) {
          followCount++

          return growthEventHelper({
            type: 'FOLLOW',
            socialNetwork: 'TWITTER',
            username: event.source.screen_name,
            event
          })
        }
      })

      await Promise.all(promises)
    }
  }

  if (req.body.tweet_create_events) {
    const events = req.body.tweet_create_events
    // Note: Splitting the events into smaller chunks to avoid DB bottleneck
    // if we receive a very large number of events at once
    const chunks = _chunk(events, process.env.CHUNK_COUNT || 100)
    totalMentionEvents = events.length
    for (const chunk of chunks) {
      const promises = chunk
        .filter(event => {
          // Ignore own tweets, retweets and favorites
          return !(
            event.retweeted ||
            event.favorited ||
            event.user.screen_name.toLowerCase() ===
              process.env.TWITTER_ORIGINPROTOCOL_USERNAME.toLowerCase()
          )
        })
        .map(event => {
          mentionCount++

          return growthEventHelper({
            type: 'SHARE',
            socialNetwork: 'TWITTER',
            username: event.user.screen_name,
            event
          })
        })

      await Promise.all(promises)
    }
  }

  if (totalFollowEvents > 0 || totalMentionEvents > 0) {
    logger.debug(
      `[TWITTER] Pushed ${followCount}/${totalFollowEvents} follow events and ${mentionCount}/${totalMentionEvents} mention events`
    )
  }
})

module.exports = router
