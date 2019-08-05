const express = require('express')
const router = express.Router()

router.use('/api', require('./account'))

module.exports = router
