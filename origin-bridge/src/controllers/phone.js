'use strict'

const express = require('express')
const router = express.Router()
const request = require('superagent')
const get = require('lodash/get')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { phoneGenerateCode, phoneVerifyCode } = require('../utils/validation')
const logger = require('../logger')

/* Generate a verification code for verifying a via using the Twilio Verify API.
 * The API supports verification by SMS or call.
 *
 * https://www.twilio.com/docs/verify/api
 */
router.post('/generate-code', phoneGenerateCode, async (req, res) => {
  const params = {
    country_code: req.body.country_calling_code,
    phone_number: req.body.phone,
    via: req.body.method,
    code_length: 6
  }

  if (req.body.locale) {
    params.locale = req.body.locale
  } else if (req.body.country_calling_code == '91') {
    // Locale not provided and calling India, override locale to English rather
    // than Hindi which is Twilio's default. English is more widely understood
    // among the Indian population
    params.locale = 'en'
  }

  try {
    await request
      .post('https://api.authy.com/protected/json/phones/verification/start')
      .send(params)
      .set('X-Authy-API-Key', process.env.TWILIO_VERIFY_API_KEY)
  } catch (error) {
    const twilioErrorCode = error.response.body['error_code']
    if (twilioErrorCode === '60033') {
      return res.status(400).send({
        errors: [
          'Phone number is invalid.'
        ]
      })
    } else if (twilioErrorCode === '60083') {
      return res.status(400).send({
        errors: [
          'Cannot send SMS to landline.'
        ]
      })
    } else {
      logger.error(`Could not send phone verification code: ${error}`)
      return res.status(500).send({
        errors: [
          'Could not send phone verification code, please try again shortly.'
        ]
      })
    }
  }

  // Save the phone verification method in the session so it can be saved along
  // with the attestation data when the verificiation of this code is successful
  req.session.phoneVerificationMethod = req.body.method

  return res.status(200).end()
})

/* Verify a phone using a previously generated verification code created through
 * the Twilio Verify API.
 *
 * The client should have a cookie set with the phoneVerificationMethod attribute
 * set from a previous call to the generate code method above.
 */
router.post('/verify', phoneVerifyCode, async (req, res) => {
  const params = {
    country_code: req.body.country_calling_code,
    phone_number: req.body.phone,
    verification_code: req.body.code
  }

  let response
  try {
    response = await request
      .get('https://api.authy.com/protected/json/phones/verification/check')
      .query(params)
      .set('X-Authy-API-Key', process.env.TWILIO_VERIFY_API_KEY)
  } catch (error) {
    const twilioErrorCode = get(error, 'response.body.error_code')
    if (twilioErrorCode === '60023') {
      return res.status(400).send({
        errors: [
          'Verification code has expired.'
        ]
      })
    } else if (twilioErrorCode === '60022') {
      return res.status(400).send({
        errors: [
          'Verification code is incorrect.'
        ]
      })
    } else {
      if (twilioErrorCode) {
        logger.error(
          `Could not verify phone verification code: ${error.response.text}`
        )
      } else {
        logger.error(`Could not verify phone verification code: ${error}`)
      }
      return res.status(500).send({
        errors: [
          'Could not verify phone verification code, please try again shortly.'
        ]
      })
    }
  }

  // This may be unnecessary because the response has a 200 status code
  // but it a good precaution to handle any inconsistency between the
  // success field and the status code
  if (!response.body['success']) {
    logger.error(`Could not verify phone verification code: ${response.body}`)
    return res.status(500).send({
      errors: [
        'Could not verify phone verification code, please try again shortly.'
      ]
    })
  }

  const attestationBody = {
    verificationMethod: {
      [req.session.phoneVerificationMethod]: true
    },
    phone: {
      verified: true
    }
  }
  const attestationValue = `${req.body.country_calling_code} ${req.body.phone}`

  const attestation = await generateAttestation(
    AttestationTypes.PHONE,
    attestationBody,
    attestationValue,
    req.body.identity,
    req.ip
  )

  res.send(attestation)
})

module.exports = router
