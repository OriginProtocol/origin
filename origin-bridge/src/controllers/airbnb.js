const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const request = require('superagent')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { generateAirbnbCode } = require('../utils')
const logger = require('../logger')

const identityValidator = check('identity')
  .not()
  .isEmpty()
  .trim()
const userIdValidator = check('airbnbUserId')
  .isInt()
  .isLength({ min: 2 })

router.get(
  '/generate-code',
  [identityValidator, userIdValidator],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: {
          [errors.array()[0].param]: errors.array()[0].msg
        }
      })
    }

    const code = generateAirbnbCode(req.query.identity, req.query.airbnbUserId)
    res.send({ code: code })
    res.end()
  }
)

router.post(
  '/verify',
  [identityValidator, userIdValidator],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: {
          [errors.array()[0].param]: errors.array()[0].msg
        }
      })
    }

    const code = generateAirbnbCode(req.body.identity, req.body.airbnbUserId)

    try {
      response = await request.get(
        `https://www.airbnb.com/users/show/${req.body.airbnbUserId}`
      )
    } catch (error) {
      if (error && error.response.status == 404) {
        return res.status(400).send({
          errors: {
            airbnbUserId: 'Airbnb user not found.'
          }
        })
      } else {
        return res.status(500).send({
          errors: ['Could not fetch Airbnb profile.']
        })
      }
    }

    if (!response.text.includes(code)) {
      return res.status(400).send({
        errors: [
          `Origin verification code "${code}" was not found in Airbnb profile.`
        ]
      })
    }

    const attestationBody = {
      verificationMethod: {
        pubAuditableUrl: {}
      },
      site: {
        siteName: 'airbnb.com',
        userId: {
          raw: req.body.airbnbUserId
        }
      }
    }

    const attestation = await generateAttestation(
      AttestationTypes.AIRBNB,
      attestationBody,
      req.body.airbnbUserId,
      req.body.identity,
      req.ip
    )

    return res.send(attestation)
  }
)

module.exports = router
