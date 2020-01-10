'use strict'

const express = require('express')
const router = express.Router()

router.use('/api/tokens', require('./tokens'))

// Returns the current timestamp of the server
router.get('/api/now', (req, res) => {
  res.status(200).send({
    timestamp: Date.now()
  })
})

module.exports = router
