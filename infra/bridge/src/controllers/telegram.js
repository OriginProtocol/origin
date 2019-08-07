'use strict'

const express = require('express')
const router = express.Router()
const request = require('superagent')
const get = require('lodash/get')
const { parsePhoneNumberFromString } = require('libphonenumber-js')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { phoneGenerateCode, phoneVerifyCode } = require('../utils/validation')
const logger = require('../logger')

// TODO: Add validation
router.post('/generate-code', async (req, res) => {
  // TODO
  return res.status(200).end()
})

router.post('/verify', async (req, res) => {
  // TODO

  const attestationBody = {
    verificationMethod: {
      oAuth: true
    },
    site: {
      siteName: 'telegram.com',
      userId: {
        raw: String('1234')
      },
      username: {
        raw: 'shahthepro'
      },
      profileUrl: {
        raw: 'https://t.me/shahthepro'
      }
    }
  }

  try {
    const attestation = await generateAttestation(
      AttestationTypes.GITHUB,
      attestationBody,
      {
        uniqueId: 1234,
        username: 'shahthepro',
        profileUrl: 'https://t.me/shahthepro',
        profileData: {}
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
