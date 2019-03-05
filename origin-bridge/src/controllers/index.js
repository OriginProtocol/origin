'use strict'

const express = require('express')
const router = express.Router()

router.use('/api/attestations/airbnb', require('./airbnb'))
router.use('/api/attestations/email', require('./email'))
router.use('/api/attestations/facebook', require('./facebook'))
router.use('/api/attestations/phone', require('./phone'))
router.use('/api/attestations/twitter', require('./twitter'))
router.use('/redirects', require('./redirects'))

module.exports = router
