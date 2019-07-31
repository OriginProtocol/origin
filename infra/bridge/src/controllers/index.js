'use strict'

const express = require('express')
const router = express.Router()

router.use('/api/attestations/airbnb', require('./airbnb'))
router.use('/api/attestations/email', require('./email'))
router.use('/api/attestations/facebook', require('./facebook'))
router.use('/api/attestations/phone', require('./phone'))
router.use('/api/attestations/twitter', require('./twitter'))
router.use('/api/attestations/google', require('./google'))
router.use('/api/attestations/website', require('./website'))
router.use('/api/attestations/kakao', require('./kakao'))
router.use('/api/attestations/github', require('./github'))
router.use('/api/attestations/linkedin', require('./linkedin'))
router.use('/api/attestations/wechat', require('./wechat'))
router.use('/redirects', require('./redirects'))
router.use('/utils', require('./utils'))
router.use('/api/promotions', require('./promotions'))
router.use('/hooks', require('./hooks/index'))

module.exports = router
