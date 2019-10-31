'use strict'

const express = require('express')
const router = express.Router()
const sendgridMail = require('@sendgrid/mail')

const Attestation = require('@origin/identity/src/models').Attestation
const AttestationTypes = Attestation.AttestationTypes
const {
  generateAttestation,
  generateTestAttestation
} = require('../utils/attestation')
const { emailGenerateCode, emailVerifyCode } = require('../utils/validation')
const { generateSixDigitCode } = require('../utils')
const logger = require('../logger')

const { redisClient, getAsync } = require('../utils/redis')

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)

router.post('/generate-code', emailGenerateCode, async (req, res) => {
  // for testing bypass
  if (process.env.EMAIL_ATTESTATION_AUTOPASS === 'true') {
    return res.end()
  }

  const code = generateSixDigitCode()

  // Set the code in redis with a 30 minute expiry
  redisClient.set(req.body.email, code, 'EX', 60 * 30)

  const email = {
    to: req.body.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Your Origin Verification Code',
    text: `Your Origin verification code is ${code}. It will expire in 30 minutes.`
  }

  try {
    await sendgridMail.send(email)
  } catch (error) {
    logger.error(`Could not send verification code via Sendgrid: ${error}`)
    return res.status(500).send({
      errors: [
        'Could not send email verification code, please try again shortly.'
      ]
    })
  }

  res.end()
})

router.post('/verify', emailVerifyCode, async (req, res) => {
  // for testing bypass
  if (process.env.EMAIL_ATTESTATION_AUTOPASS === 'true') {
    return res.send(
      generateTestAttestation(AttestationTypes.EMAIL, {
        verificationMethod: {
          email: true
        },
        email: {
          verified: true
        }
      })
    )
  }
  const code = await getAsync(req.body.email)

  if (!code) {
    logger.warn(`Attempted attestation for ${req.body.email} without session.`)
    return res.status(400).send({
      errors: ['No verification code was found for that email.']
    })
  }

  if (String(code) !== String(req.body.code)) {
    return res.status(400).send({
      errors: ['Verification code is incorrect.']
    })
  }

  // Generate the attestation
  const attestationBody = {
    verificationMethod: {
      email: true
    },
    email: {
      verified: true
    }
  }

  const attestation = await generateAttestation(
    AttestationTypes.EMAIL,
    attestationBody,
    {
      uniqueId: req.body.email
    },
    req.body.identity,
    req.ip
  )

  return res.send(attestation)
})

module.exports = router
