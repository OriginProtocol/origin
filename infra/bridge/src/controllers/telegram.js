'use strict'

const express = require('express')
const router = express.Router()

const { telegramAttestation } = require('../utils/validation')

const { redisClient, getAsync } = require('../utils/redis')

router.post('/generate-code', telegramAttestation, async (req, res) => {
  const identity = req.query.identity.toLowerCase()

  // Store IP to redis
  redisClient.set(
    `telegram/attestation/${identity}`,
    JSON.stringify({
      ip: req.ip
    }),
    'EX',
    60 * 30
  )

  res.status(200).send({
    code: identity
  })
})

/**
 * Used to check if the user has done any attestation recently
 * @param {String} query.identity User's ETH address
 * @returns {Object} an object similar to `{ verified: <Boolean>, attestation?: <String> }`
 */
router.get('/status', telegramAttestation, async (req, res) => {
  const identity = req.query.identity.toLowerCase()

  const key = `telegram/attestation/${identity}/status`

  let statusObj = await getAsync(key)

  statusObj = statusObj ? JSON.parse(statusObj) : null

  const verified = !!(statusObj && statusObj.verified && statusObj.attestation)

  // Delete from redis, once verified
  if (verified) {
    redisClient.del(key)
  }

  res.status(200).send({
    ...statusObj,
    verified
  })
})

module.exports = router
