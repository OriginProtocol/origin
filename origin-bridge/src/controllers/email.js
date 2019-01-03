const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')

router.post('/email/generate-code', (req, res) => {
})

router.post('/email/verify', (req, res) => {
})

module.exports = router
