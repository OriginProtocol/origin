'use strict'

const express = require('express')
const router = express.Router()

router.use('/api/tokens', require('./tokens'))

module.exports = router
