'use strict'

const express = require('express')
const router = express.Router()
const request = require('superagent')
const crypto = require('crypto')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { facebookVerify } = require('../utils/validation')
const logger = require('./logger')

const { getAbsoluteUrl, mapObjectToQueryParams } = require('../utils')
const constants = require('../constants')

router.get('/auth-url', (req, res) => {
  const dappRedirectUrl = req.query.dappRedirectUrl || null
  const params = {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    redirect_uri: getAbsoluteUrl('/redirects/facebook/', dappRedirectUrl)
  }
  const url = constants.FACEBOOK_BASE_AUTH_URL + mapObjectToQueryParams(params)
  res.send({ url: url })
})

router.post('/verify', facebookVerify, async (req, res) => {
  const params = {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
    redirect_uri: getAbsoluteUrl('/redirects/facebook/'),
    code: req.body.code
  }

  let accessToken
  try {
    const response = await request
      .get(constants.FACEBOOK_BASE_GRAPH_URL + '/v3.2/oauth/access_token')
      .query(params)
    accessToken = response.body.access_token
  } catch (error) {
    logger.error(error)
    return res.send(500).send({
      errors: ['Could not get access token']
    })
  }

  const appSecretProof = crypto
    .createHmac('sha256', process.env.FACEBOOK_CLIENT_SECRET)
    .update(accessToken)
    .digest('hex')

  const userDataResponse = await request
    .get(constants.FACEBOOK_BASE_GRAPH_URL + '/me')
    .query({
      appsecret_proof: appSecretProof,
      access_token: accessToken
    })

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
