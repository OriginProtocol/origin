const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')

router.get('/twitter/auth-url', (req, res) => {
})

router.post('/twitter/verify', (req, res) => {
})

module.exports = router
