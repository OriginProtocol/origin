const express = require('express')
const router = express.Router()

router.use('/api', require('./account'))
router.use('/api', require('./login'))

module.exports = router
