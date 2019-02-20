const express = require('express')
const router = express.Router()
const request = require('superagent')

const Attestation = require('../models/attestation')
const logger = require('../logger')

router.post('/generate-code', (req, res) => {
  if (!['sms', 'call'].includes(req.body.method)) {
    return res
      .status(400)
      .json({
        errors: [`Invalid phone verification method: ${req.body.method}`]
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

  request
    .post('https://api.authy.com/protected/json/phones/verification/start')
    .send(params)
    .set('X-Authy-API-Key', process.env.TWILIO_VERIFY_API_KEY)
    .then(response => {
      return res.status(200).end()
    })
    .catch(error => {
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
        return res
          .status(500)
          .send(
            'Could not send phone verification code, please try again later.'
          )
      }
    })
})

router.post('/verify', (req, res) => {})

module.exports = router
