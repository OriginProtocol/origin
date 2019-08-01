'use strict'

const express = require('express')
const router = express.Router()
const querystring = require('querystring')
const crypto = require('crypto')
const constants = require('../../constants')
const logger = require('../../logger')
const { redisClient } = require('../../utils/redis')

const {
  getTwitterOAuthRequestToken,
  getTwitterOAuthAccessToken,
  verifyTwitterCredentials
} = require('../../utils/twitter')

const { subscribeToHooks } = require('./../../hooks/twitter')

/**
 * To generate a authtoken of the target account and subscribe to events
 * Should be run manually once deployed for the first time
 */
router.get('/twitter/__init', async (req, res) => {
  let oAuthToken, oAuthTokenSecret
  try {
    const twitterResponse = await getTwitterOAuthRequestToken({
      sid: req.sessionID,
      redirectUrl: '/hooks/twitter/__auth-redirect'
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
router.get('/twitter/__auth-redirect', async (req, res) => {
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
      req.query.oauth_verifier
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
      oAuthAccessTokenSecret
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
router.get('/twitter', (req, res) => {
  const hmac = crypto
    .createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET)
    .update(req.query.crc_token)
    .digest('base64')

  res.status(200).send({
    response_token: `sha256=${hmac}`
  })
})

/**
 * Twitter posts events to this endpoint
 * Should always return 200 with no response
 */
router.post('/twitter', (req, res) => {
  let followCount = 0

  // Use redis batch for parallelization (without atomicity)
  const redisBatch = redisClient.batch()

  let totalFollowEvents = 0
  let totalMentionEvents = 0

  if (req.body.follow_events) {
    // Follow event(s)
    const events = req.body.follow_events
    totalFollowEvents = events.length
    events.forEach(event => {
      if (
        event.target.screen_name.toLowerCase() ===
        process.env.TWITTER_ORIGINPROTOCOL_USERNAME.toLowerCase()
      ) {
        followCount++
        const key = `twitter/follow/${event.source.id_str}`
        redisBatch.set(key, JSON.stringify(event), 'EX', 60 * 30)
        logger.info(
          `Pushing twitter follow event for ${event.source.screen_name} at ${key}...`
        )
      }
    })
  }

  let mentionCount = 0
  if (req.body.tweet_create_events) {
    const events = req.body.tweet_create_events
    totalMentionEvents = events.length
    events
      .filter(event => {
        // Ignore own tweets, retweets and favorites
        return (
          !event.retweeted &&
          !event.favorited &&
          event.user.screen_name.toLowerCase() !==
            process.env.TWITTER_ORIGINPROTOCOL_USERNAME.toLowerCase()
        )
      })
      .forEach(event => {
        mentionCount++
        const key = `twitter/share/${event.user.id_str}`
        redisBatch.set(key, JSON.stringify(event), 'EX', 60 * 30)
        logger.info(
          `Pushing twitter mention event for ${event.user.screen_name} at ${key}...`
        )
      })
  }

  redisBatch.exec(err => {
    if (err) {
      logger.error(
        `Faile to push ${followCount}/${totalFollowEvents} follow events and ${mentionCount}/${totalMentionEvents} mention events to redis`
      )
    } else {
      logger.info(
        `Pushed ${followCount}/${totalFollowEvents} follow events and ${mentionCount}/${totalMentionEvents} mention events to redis`
      )
    }
  })

  res.status(200).end()
})

module.exports = router
