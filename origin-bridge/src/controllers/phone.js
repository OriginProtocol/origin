const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')

router.post('/phone/generate-code', (req, res) => {
})

router.post('/phone/verify', (req, res) => {
})

module.exports = router
