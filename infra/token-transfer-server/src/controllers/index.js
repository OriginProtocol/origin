const express = require('express')
const router = express.Router()

router.use('/api', require('./account'))
router.use('/api', require('./event'))
router.use('/api', require('./grant'))
router.use('/api', require('./lockup'))
router.use('/api', require('./login'))
router.use('/api', require('./transfer'))
router.use('/api', require('./user'))

module.exports = router
