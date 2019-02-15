const express = require('express')
const router = express.Router()

const {
  asyncMiddleware,
  mapObjectToQueryParams,
  generateAttestationSignature,
  getTwitterOAuthRequestToken,
  getTwitterOAuthAccessToken,
  verifyTwitterCredentials
} = require('../utils')

const constants = require('../constants')
const Attestation = require('../models/index').Attestation;
const AttestationTypes = Attestation.AttestationTypes

router.get('/auth-url', asyncMiddleware(async (req, res) => {
  const { oAuthToken, oAuthTokenSecret } = await getTwitterOAuthRequestToken()
  req.session.oAuthToken = oAuthToken
  req.session.oAuthTokenSecret = oAuthTokenSecret
  const url = constants.TWITTER_BASE_AUTH_URL + mapObjectToQueryParams({'oauth_token': oAuthToken})
  res.send({url})
}))

router.post('/verify', asyncMiddleware(async (req, res) => {
  const { oAuthAccessToken, oAuthAccessTokenSecret } = await getTwitterOAuthAccessToken(req.session.oAuthToken, req.session.oAuthTokenSecret, req.body['oauth-verifier'])
  const screenName = await verifyTwitterCredentials(oAuthAccessToken, oAuthAccessTokenSecret)

  data = {
    'issuer': constants.ISSUER,
    'issueDate': new Date(),
    'attestation': {
      'verificationMethod': {
        'oAuth': true
      },
      'site': {
        'siteName': 'twitter.com',
        'userId': {
          'raw': screenName
        }
      }
    }
  }
  const ethAddress = req.body.identity

  const signature = {
    'bytes': generateAttestationSignature(process.env.ATTESTATION_SIGNING_KEY, ethAddress, JSON.stringify(data)),
    'version': '1.0.0'
  }

  await Attestation.create({
    method: AttestationTypes.TWITTER,
    eth_address: ethAddress,
    value: screenName,
    signature: signature['bytes'],
    remote_ip_address: req.ip
  });

  res.send({
    'schemaId': 'https://schema.originprotocol.com/attestation_1.0.0.json',
    'data': data,
    'signature': signature
  })
}))

module.exports = router
