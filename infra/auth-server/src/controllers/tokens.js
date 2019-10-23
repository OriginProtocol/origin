const express = require('express')
const router = express.Router()

const verifySign = require('../utils/verify-sign')
const generateToken = require('../utils/generate-token')
const verifyToken = require('../utils/verify-token')
const revokeToken = require('../utils/revoke-token')

const authMiddleware = require('../middlewares/auth')

const logger = require('../logger')

// TODO: Add param validation
router.post('/', async (req, res) => {
  const { payload, signature, address } = req.body

  const validSign = verifySign({
    address,
    payload,
    signature
  })

  if (!validSign) {
    // It is invalid sign
    return res.status(400).send({
      success: false,
      errors: ['Failed to verify signature']
    })
  }

  const authToken = await generateToken({
    address,
    signature,
    payload,
    ip: req.ip
  })

  if (!authToken) {
    return res.status(500).send({
      success: false,
      errors: ['Failed to generate auth token']
    })
  }

  return res.status(201).send({
    success: true,
    authToken
  })
})

// TODO: Add param validation
router.post('/revoke', authMiddleware, async (req, res) => {
  const user = req.__originAuth
  const { token } = req.body

  const tokenData = await verifyToken(token, true)

  if (!tokenData) {
    return res.status(404).send({
      success: false,
      errors: ['Invalid token']
    })
  }

  if (tokenData.address !== user.address) {
    logger.error(
      `${user.address} trying to revoke token of ${tokenData.address}`
    )
    return res.status(403).send({
      success: false,
      errors: ['Unauthorized to revoke token']
    })
  }

  // TODO: What if req.body.token === req.headers.authorization?
  // Can the user revoke the token he is using for this request?

  const revoked = await revokeToken(token, {
    ...user,
    ip: req.ip
  })

  if (!revoked) {
    return res.status(500).send({
      success: false,
      errors: ['Failed to revoke token']
    })
  }

  return res.status(200).send({
    success: true
  })
})

module.exports = router
