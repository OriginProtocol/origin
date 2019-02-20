const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')
const { generateSixDigitCode } = require('../utils')

router.post('/generate-code', (req, res) => {
  const code = generateSixDigitCode()

  req.session.emailAttestation = {
    email: req.body.email,
    code: code,
    expiry: ''
  }

  res.send({ code: code }).end()
})

router.post('/verify', (req, res) => {})

module.exports = router
