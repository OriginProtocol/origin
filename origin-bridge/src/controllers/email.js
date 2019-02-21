const express = require('express')
const bcrypt= require('bcrypt')
const router = express.Router()
const sendgridMail = require('@sendgrid/mail')

const Attestation = require('../models/attestation')
const { generateSixDigitCode } = require('../utils')

router.post('/generate-code', (req, res) => {
  const code = generateSixDigitCode()

  // Hash the email so it doesn't get stored in the session in plain text
  const salt = bcrypt.getnSaltSync(10)
  const emailhash = bcrypt.hashSync(req.body.email, salt)

  const now = new Date()
  req.session.emailAttestation = {
    emailHash: emailHash,
    code: code,
    expiry: now.setMinutes(now.getMinutes() + 30)
  }

  const email = {
    to: req.body.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Your Origin Verification Code',
    text: `Your Origin verification code is ${code}. It will expire in 30 minutes.`
  }

  try {
    sendgridEmail.send(email)
  } catch (error) {
    logger.error(`Could not send verification code via Sendgrid: ${error}`)
    return res
      .status(500)
      .end('Could not send verification code. Please try again shortly')
  }

  res.end()
})

router.post('/verify', async (req, res) => {
  const validHash = bcrypt.compareSync(req.body.email, req.session.emailAttestation.emailHash)

  if (!validHash) {
    return res.status(400).send({
      errors: {
        email: 'No verification code was not found that email.'
      }
    })
  }

  if (req.session.emailAttestation.expiry < new Date()) {
    return res.status(400).send({
      errors: {
        code: 'Verification code has expired.'
      }
    })
  }

  if (req.session.emailAttestation.code !== req.body.code) {
    return res.status(400).send({
      errors: {
        code: 'Verification code is incorrect.'
      }
    })
  }

  // Delete req.session.emailAttestation
  data = {
    issuer: constants.ISSUER,
    issueDate: new Date(),
    attestation: {
      verificationMethod: {
        email: true
      },
      email: {
        verified: true
      }
    }
  }

  // TODO: verify determinism of JSONifying data for hashing

  const signature = {
    bytes: generateAttestationSignature(
      process.env.ATTESTATION_SIGNING_KEY,
      req.body.eth_address,
      JSON.stringify(data)
    ),
    version: '1.0.0'
  }

  // Save the attestation in the database
  await Attestation.create({
    method: AttestationTypes.EMAIL,
    ethAddress: req.body.eth_address,
    value: req.body.email,
    signature: signature['bytes'],
    remoteIpAddress: req.ip
  })

  res.send({
    schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json',
    data: data,
    signature: signature
  })
})

module.exports = router
