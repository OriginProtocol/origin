const express = require('express')
const router = express.Router()

router.use('/airbnb', require('./airbnb'))
router.use('/email', require('./email'))
router.use('/facebook', require('./facebook'))
router.use('/phone', require('./phone'))
router.use('/twitter', require('./twitter'))
router.use('/redirects', require('./redirects'))

module.exports = router
