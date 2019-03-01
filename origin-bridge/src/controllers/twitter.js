'use strict'

const express = require('express')
const router = express.Router()

const {
  getTwitterOAuthRequestToken,
  getTwitterOAuthAccessToken,
  verifyTwitterCredentials
} = require('../utils/twitter')
const { generateAttestation } = require('../utils/attestation')
const { mapObjectToQueryParams } = require('../utils')
const { twitterVerifyCode } = require('../utils/validation')
const constants = require('../constants')
const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const logger = require('../logger')

/* Get an oAuth request token from Twitter.
 *
 */
router.get('/auth-url', async (req, res) => {
  const dappRedirectUrl = req.query.dappRedirectUrl || null

  let oAuthToken, oAuthTokenSecret
  try {
    // eslint-disable-next-line no-extra-semi
    ;({ oAuthToken, oAuthTokenSecret } = await getTwitterOAuthRequestToken(
      dappRedirectUrl
    ))
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
    mapObjectToQueryParams({ oauth_token: oAuthToken })

  res.send({ url })
})

/* Get an oAuth access token from Twitter using the `oauth-verifier` parameter
 * obtained from the login flow.
 */
router.post('/verify', twitterVerifyCode, async (req, res) => {
  let oAuthAccessToken, oAuthAccessTokenSecret
  try {
    // eslint-disable-next-line no-extra-semi
    ;({
      oAuthAccessToken,
      oAuthAccessTokenSecret
    } = await getTwitterOAuthAccessToken(
      req.session.oAuthToken,
      req.session.oAuthTokenSecret,
      req.body['oauth-verifier']
    ))
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

  const attestation = await generateAttestation(
    AttestationTypes.TWITTER,
    attestationBody,
    screenName,
    req.body.identity,
    req.ip
  )

  return res.send(attestation)
})

module.exports = router
