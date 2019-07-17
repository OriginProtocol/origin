'use strict'

const express = require('express')
const router = express.Router()
const crypto = require('crypto')

router.get('/twitter', (req, res) => {
  const { crc_token } = req.query

  const hmac = crypto.createHmac('sha256', process.env.TWITTER_ORIGIN_CONSUMER_SECRET).update(crc_token).digest('base64')
  console.log(crc_token, hmac)
  res.status(200).send({
    response_token: `sha256=${hmac}`
  })
})

router.post('/twitter', (req, res) => {
  res.status(200).end()
})

module.exports = router