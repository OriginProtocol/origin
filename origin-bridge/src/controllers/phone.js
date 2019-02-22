const express = require('express')
const router = express.Router()
const request = require('superagent')
const { check, validationResult } = require('express-validator/check')

const logger = require('../logger')

const { generateAttestation } = require('../utils/attestation')

/* Generate a verification code for verifying a via using the Twilio Verify API.
 * The API supports verification by SMS or call.
 *
 * https://www.twilio.com/docs/verify/api
 */
router.post(
  '/generate-code',
  [
    check('country_calling_code')
      .not()
      .isEmpty()
      .trim(),
    check('phone_number')
      .not()
      .isEmpty()
      .trim(),
    check('method', 'Invalid phone verification method')
      .isIn(['sms', 'call'])
      .trim()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: {
          [errors.array()[0].param]: errors.array()[0].msg
        }
      })
    }

    const params = {
      country_code: req.body.country_calling_code,
      phone_number: req.body.phone_number,
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
          errors: {
            phone: 'Phone number is invalid.'
          }
        })
      } else if (twilioErrorCode === '60083') {
        return res.status(400).send({
          errors: {
            phone: 'Cannot send SMS to landline.'
          }
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
  }
)

/* Verify a phone using a previously generated verification code created through
 * the Twilio Verify API.
 *
 * The client should have a cookie set with the phoneVerificationMethod attribute
 * set from a previous call to the generate code method above.
 */
router.post(
  '/verify',
  [
    check('country_calling_code')
      .not()
      .isEmpty()
      .trim(),
    check('phone_number')
      .not()
      .isEmpty()
      .trim(),
    check('code')
      .not()
      .isEmpty()
      .trim()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: {
          [errors.array()[0].param]: errors.array()[0].msg
        }
      })
    }

    const params = {
      country_code: req.body.country_calling_code,
      phone_number: req.body.phone_number,
      code: req.body.code
    }

    let response
    try {
      response = await request
        .post('https://api.authy.com/protected/json/phones/verification/check')
        .send(params)
        .set('X-Authy-API-Key', process.env.TWILIO_VERIFY_API_KEY)
    } catch (error) {
      const twilioErrorCode = error.response.body['error_code']
      if (twilioErrorCode === '60023') {
        return res.status(400).send({
          errors: {
            phone: 'Verification code has expired.'
          }
        })
      } else if (twilioErrorCode === '60022') {
        return res.status(400).send({
          errors: {
            phone: 'Verification code is incorrect.'
          }
        })
      } else {
        logger.error(`Could not verify phone verification code: ${error}`)
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
    const attestationValue = `${req.body.country_calling_code} ${
      req.body.phone_number
    }`

    const attestation = await generateAttestation(
      attestationBody,
      attestationValue,
      req.body.eth_address,
      req.ip
    )

    res.send(attestation)
  }
)

module.exports = router
