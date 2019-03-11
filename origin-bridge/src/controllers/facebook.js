'use strict'

const express = require('express')
const router = express.Router()
const request = require('superagent')
const crypto = require('crypto')
const querystring = require('querystring')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { facebookVerify } = require('../utils/validation')
const logger = require('../logger')

const { getAbsoluteUrl } = require('../utils')
const constants = require('../constants')

/* Generate a URL for the user to be redirected to that prompts for a Facebook
 * login and then redirects to the URL specified in the redirect_uri parameter.
 *
 */
router.get('/auth-url', (req, res) => {
  const dappRedirectUrl = req.query.dappRedirectUrl || null
  const params = {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    redirect_uri: getAbsoluteUrl('/redirects/facebook/', dappRedirectUrl)
  }
  const url = constants.FACEBOOK_BASE_AUTH_URL + querystring.stringify(params)
  res.send({ url: url })
})

/* Exchange code from login dialog for an access token and generate attestation
 * from the user data.
 */
router.post('/verify', facebookVerify, async (req, res) => {
  const params = {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
    redirect_uri: getAbsoluteUrl('/redirects/facebook/'),
    code: req.body.code
  }

  // Exchange code for an access token
  let accessToken
  try {
    const response = await request
      .get(constants.FACEBOOK_BASE_GRAPH_URL + '/v3.2/oauth/access_token')
      .query(params)
    accessToken = response.body.access_token
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Could not get access token']
    })
  }

  const appSecretProof = crypto
    .createHmac('sha256', process.env.FACEBOOK_CLIENT_SECRET)
    .update(accessToken)
    .digest('hex')

  // Verify the token and determine the user account that it was generated for,
  // use that data to generate the attetation
  let userDataResponse
  try {
    userDataResponse = await request
      .get(constants.FACEBOOK_BASE_GRAPH_URL + '/me')
      .query({
        appsecret_proof: appSecretProof,
        access_token: accessToken
      })
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Error validating access token']
    })
  }

  const attestationBody = {
    verificationMethod: {
      oAuth: true
    },
    site: {
      siteName: 'facebook.com',
      userId: {
        verified: true
      }
    }
  }

  const attestation = await generateAttestation(
    AttestationTypes.FACEBOOK,
    attestationBody,
    userDataResponse.body.name,
    req.body.identity,
    req.ip
  )

  return res.send(attestation)
})

module.exports = router
