const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')

const Attestation = require('../models/attestation')
const { generateAirbnbCode } = require('../utils')

router.get(
  '/generate-code',
  [
    check('ethAddress')
      .not()
      .isEmpty()
      .trim(),
    check('userId')
      .isInt()
      .isLength({ min: 2 })
  ],
  (req, res) => {
    const code = generateAirbnbCode(req.query.ethAddress, req.query.userId)
    res.send({ code: code })
    res.end()
  }
)

router.post('/verify', (req, res) => {})

module.exports = router
