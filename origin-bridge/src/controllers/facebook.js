const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')

router.get('/facebook/auth-url', (req, res) => {
})

router.post('/facebook/verify', (req, res) => {
})

module.exports = router
