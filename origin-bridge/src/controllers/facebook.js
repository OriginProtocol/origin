const express = require('express')
const router = express.Router()
const request = require('superagent')
const crypto = require('crypto')
const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes

const {
  getAbsoluteUrl,
  mapObjectToQueryParams,
  asyncMiddleware,
  generateAttestationSignature
} = require('../utils')
const constants = require('../constants')

router.get('/auth-url', (req, res) => {
  params = {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    redirect_uri: getAbsoluteUrl('/redirects/facebook/')
  }
  url = constants.FACEBOOK_BASE_AUTH_URL + mapObjectToQueryParams(params)
  res.send({ url: url })
})

router.post(
  '/verify',
  asyncMiddleware(async (req, res) => {
    params = {
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      redirect_uri: getAbsoluteUrl('/redirects/facebook/'),
      code: req.body.code
    }

    const accessTokenResponse = await request
      .get(constants.FACEBOOK_BASE_GRAPH_URL + '/v3.2/oauth/access_token')
      .query(params)
    const accessToken = accessTokenResponse.body.access_token
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

    data = {
      issuer: constants.ISSUER,
      issueDate: new Date(),
      attestation: {
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
    }

    const name = JSON.parse(userDataResponse.text)['name']
    const ethAddress = req.body.identity

    const signature = {
      bytes: generateAttestationSignature(
        process.env.ATTESTATION_SIGNING_KEY,
        ethAddress,
        JSON.stringify(data)
      ),
      version: '1.0.0'
    }

    await Attestation.create({
      method: AttestationTypes.FACEBOOK,
      eth_address: ethAddress,
      value: name,
      signature: signature['bytes'],
      remote_ip_address: req.ip
    })

    res.send({
      schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json',
      data: data,
      signature: signature
    })
  })
)

module.exports = router
