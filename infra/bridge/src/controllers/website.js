'use strict'

const express = require('express')
const router = express.Router()
const request = require('superagent')
const get = require('lodash/get')

const Attestation = require('@origin/identity/src/models').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { websiteGenerateCode, websiteVerify } = require('../utils/validation')
const { generateAttestation } = require('../utils/attestation')
const { generateWebsiteCode } = require('../utils')
const logger = require('../logger')

router.get('/generate-code', websiteGenerateCode, async (req, res) => {
  const code = generateWebsiteCode(req.query.identity, req.query.website)
  res.send({ code })
})

router.post('/verify', websiteVerify, async (req, res) => {
  const { identity, website } = req.body
  const code = generateWebsiteCode(identity, website)

  // Ignore the pathname and query params in the URL and
  // check if the file exists in the root of the domain
  const remoteOrigin = new URL(website).origin
  const remoteFileURL = `${remoteOrigin}/${identity}.html`

  let response
  try {
    response = await request.get(remoteFileURL)
  } catch (error) {
    const statusCode = get(error, 'response.status')
    if (statusCode === 404) {
      logger.warn(`File "${identity}.html" not found`)
      return res.status(400).send({
        errors: [`File "${identity}.html" was not found in remote host.`]
      })
    } else {
      return res.status(500).send({
        errors: [`Could not fetch website at '${remoteOrigin}'.`]
      })
    }
  }

  if (response.text.trim() !== code) {
    return res.status(400).send({
      errors: [`Origin verification code is incorrect.`]
    })
  }

  const attestationBody = {
    verificationMethod: {
      pubAuditableUrl: {
        proofUrl: remoteFileURL
      }
    },
    domain: {
      verified: true
    }
  }

  try {
    const attestation = await generateAttestation(
      AttestationTypes.WEBSITE,
      attestationBody,
      {
        uniqueId: remoteOrigin
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
