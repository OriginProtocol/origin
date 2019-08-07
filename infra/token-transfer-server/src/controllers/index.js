const express = require('express')
const router = express.Router()

router.use('/api', require('./account'))
router.use('/api', require('./login'))
router.use('/api', require('./grant'))

module.exports = router
