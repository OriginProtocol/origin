const express = require('express')
const router = express.Router()

const Attestation = require('../models/attestation')

router.get('/facebook', (req, res) => {
  res.sendfile('src/static/facebook.html')
})

router.get('/twitter', (req, res) => {
  res.sendfile('src/static/twitter.html')
})

module.exports = router
