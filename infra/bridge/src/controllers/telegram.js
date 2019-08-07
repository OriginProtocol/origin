'use strict'

const express = require('express')
const router = express.Router()

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
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
        raw: String('908534709')
      },
      username: {
        raw: 'shahulhameid'
      },
      profileUrl: {
        raw: 'https://t.me/shahulhameid'
      }
    }
  }

  try {
    const attestation = await generateAttestation(
      AttestationTypes.TELEGRAM,
      attestationBody,
      {
        uniqueId: 908534709,
        username: 'shahulhameid',
        profileUrl: 'https://t.me/shahulhameid',
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
