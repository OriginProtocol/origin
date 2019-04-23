'use strict'

const express = require('express')
const router = express.Router()
const request = require('superagent')
const querystring = require('querystring')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { googleVerify } = require('../utils/validation')
const logger = require('../logger')

const { getAbsoluteUrl } = require('../utils')
const constants = require('../constants')

/* Generate a URL for the user to be redirected to that prompts for a Google
 * login and then redirects to the URL specified in the redirect_uri parameter.
 *
 */
router.get('/auth-url', (req, res) => {
  const dappRedirectUrl = req.query.dappRedirectUrl || null
  const params = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    scope: 'email',
    response_type: 'code',
    redirect_uri: getAbsoluteUrl('/redirects/google/', dappRedirectUrl)
  }
  const url = constants.GOOGLE_BASE_AUTH_URL + querystring.stringify(params)
  res.send({ url: url })
})

/* Exchange code from login dialog for an access token and generate attestation
 * from the user data.
 */
router.post('/verify', googleVerify, async (req, res) => {
  const params = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: getAbsoluteUrl('/redirects/google/'),
    code: req.body.code,
    grant_type: 'authorization_code'
  }

  // Exchange code for an access token
  let accessToken
  try {
    const response = await request
      .post(constants.GOOGLE_BASE_API_URL + '/oauth2/v4/token')
      .query(params)
    accessToken = response.body.access_token
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Could not get access token']
    })
  }

  // Verify the token and determine the user account that it was generated for,
  // use that data to generate the attetation
  let userDataResponse
  try {
    userDataResponse = await request
      .get(constants.GOOGLE_BASE_API_URL + '/oauth2/v2/userinfo')
      .query({
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
      siteName: 'google.com',
      userId: {
        verified: true
      }
    }
  }

  const attestation = await generateAttestation(
    AttestationTypes.GOOGLE,
    attestationBody,
    userDataResponse.body.email,
    req.body.identity,
    req.ip
  )

  return res.send(attestation)
})

module.exports = router
