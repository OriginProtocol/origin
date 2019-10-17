'use strict'

const express = require('express')
const router = express.Router()
const request = require('superagent')
const querystring = require('querystring')

const Attestation = require('@origin/identity/src/models').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { wechatVerify } = require('../utils/validation')
const logger = require('../logger')

const { getAbsoluteUrl } = require('../utils')
const constants = require('../constants')

/**
 * Generate a URL for the user to be redirected to that prompts for a WeChat
 * login and then redirects to the URL specified in the redirect_uri parameter.
 */
router.get('/auth-url', (req, res) => {
  const redirect = req.query.redirect || null

  const params = {
    appid: process.env.WECHAT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getAbsoluteUrl('/redirects/wechat/'),
    scope: 'snsapi_login,snsapi_userinfo'
  }

  if (redirect) {
    params.state = req.sessionID
    req.session.redirect = redirect
  }

  const url = `${constants.WECHAT_BASE_AUTH_URL}?${querystring.stringify(
    params
  )}`

  res.send({ url: url })
})

/* Exchange code from login dialog for an access token and generate attestation
 * from the user data.
 */
router.post('/verify', wechatVerify, async (req, res) => {
  const params = {
    appid: process.env.WECHAT_CLIENT_ID,
    secret: process.env.WECHAT_CLIENT_SECRET,
    code: req.body.code,
    grant_type: 'authorization_code'
  }

  if (req.body.sid) {
    try {
      const session = await req.sessionStore.get(req.body.sid)
      params.code = session.code
      params.state = req.body.sid
    } catch (e) {
      return res.status(400).send({
        errors: ['Invalid session']
      })
    }
  }

  // Exchange code for an access token
  let accessToken, openId
  try {
    const response = await request
      .post(`${constants.WECHAT_BASE_API_URL}/oauth2/access_token`)
      .query(params)
      .set({
        Accept: 'application/json'
      })
    accessToken = response.body.access_token
    openId = response.body.openid
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
      .get(`${constants.WECHAT_BASE_API_URL}/userinfo`)
      .query({
        access_token: accessToken,
        openid: openId
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
      siteName: 'wechat.com',
      userId: {
        raw: String(userDataResponse.body.unionid)
      }
    }
  }

  try {
    const attestation = await generateAttestation(
      AttestationTypes.WECHAT,
      attestationBody,
      {
        uniqueId: userDataResponse.body.unionid,
        profileData: userDataResponse
      },
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
