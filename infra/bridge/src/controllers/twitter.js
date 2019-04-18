'use strict'

const express = require('express')
const router = express.Router()
const querystring = require('querystring')

const {
  getTwitterOAuthRequestToken,
  getTwitterOAuthAccessToken,
  verifyTwitterCredentials
} = require('../utils/twitter')
const { generateAttestation } = require('../utils/attestation')
const { twitterVerifyCode } = require('../utils/validation')
const constants = require('../constants')
const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const logger = require('../logger')

/* Get an oAuth request token from Twitter.
 *
 */
router.get('/auth-url', async (req, res) => {
  const redirect = req.query.redirect || null

  let oAuthToken, oAuthTokenSecret
  try {
    const twitterResponse = await getTwitterOAuthRequestToken(
      redirect ? req.sessionID : null
    )
    oAuthToken = twitterResponse.oAuthToken
    oAuthTokenSecret = twitterResponse.oAuthTokenSecret
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Failed to get Twitter OAuth request token.']
    })
  }

  if (redirect) {
    req.session.redirect = redirect
  }
  req.session.oAuthToken = oAuthToken
  req.session.oAuthTokenSecret = oAuthTokenSecret

  const url =
    constants.TWITTER_BASE_AUTH_URL +
    querystring.stringify({ oauth_token: oAuthToken })

  res.send({ url })
})

/* Get an oAuth access token from Twitter using the `oauth-verifier` parameter
 * obtained from the login flow.
 */
router.post('/verify', twitterVerifyCode, async (req, res) => {
  let session = req.session
  let verifier = req.body['oauth-verifier']
  if (req.body.sid) {
    session = await req.sessionStore.get(req.body.sid)
    verifier = session.code
  }
  console.log('session', session)
  if (!session.oAuthToken || !session.oAuthTokenSecret) {
    return res.status(400).send({
      errors: ['Invalid Twitter oAuth session.']
    })
  }

  let oAuthAccessToken, oAuthAccessTokenSecret
  try {
    const accessToken = await getTwitterOAuthAccessToken(
      session.oAuthToken,
      session.oAuthTokenSecret,
      verifier
    )
    oAuthAccessToken = accessToken.oAuthAccessToken
    oAuthAccessTokenSecret = accessToken.oAuthAccessTokenSecret
    console.log(oAuthAccessToken, oAuthAccessTokenSecret)
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

  let screenName
  try {
    screenName = await verifyTwitterCredentials(
      oAuthAccessToken,
      oAuthAccessTokenSecret
    )
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Could not verify Twitter credentials.']
    })
  }

  const attestationBody = {
    verificationMethod: {
      oAuth: true
    },
    site: {
      siteName: 'twitter.com',
      userId: {
        raw: screenName
      }
    }
  }

  try {
    const attestation = await generateAttestation(
      AttestationTypes.TWITTER,
      attestationBody,
      screenName,
      req.body.identity,
      req.ip
    )

    return res.send(attestation)
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Could not create attestation.']
    })
  }
})

module.exports = router
