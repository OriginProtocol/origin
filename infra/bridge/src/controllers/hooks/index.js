'use strict'

const express = require('express')
const router = express.Router()

router.use('/twitter', require('./twitter'))
router.use('/telegram', require('./telegram'))

module.exports = router
