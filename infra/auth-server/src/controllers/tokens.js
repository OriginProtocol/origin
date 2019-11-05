const express = require('express')
const router = express.Router()

const verifySign = require('../utils/verify-sign')
const {
  generateToken,
  tokenBlacklist,
  verifyToken
} = require('@origin/auth-utils/src/utils')
const authMiddleware = require('@origin/auth-utils/src/middleware/auth')

const {
  generateTokenValidation,
  revokeTokenValidation
} = require('../utils/validation')

const logger = require('../logger')

/**
 * Can be used to check the validity of a token
 */
router.get('/', authMiddleware, (req, res) => {
  return res.status(200).send({
    success: true
  })
})

/**
 * To create a new auth token
 *
 * @param {String} address ETH address of the signer
 * @param {String} signature The actual signature
 * @param {Object} payload The data that was signed
 */
router.post('/', generateTokenValidation, async (req, res) => {
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

  try {
    const tokenData = generateToken({
      address
    })

    return res.status(201).send({
      ...tokenData,
      success: true
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      errors: ['Failed to generate auth token']
    })
  }
})

/**
 * Revokes and blacklists a valid token
 *
 * @returns {Boolean} result.success = true if token has been revoked.
 */
router.post(
  '/revoke',
  [authMiddleware, ...revokeTokenValidation],
  async (req, res) => {
    const user = req.__originAuth
    const { token } = req.body

    let tokenData
    try {
      tokenData = await verifyToken(token)
    } catch (err) {
      logger.error('Failed to verify and revoke token', err)
      // Make sure token is valid one
      return res.status(400).send({
        success: false,
        errors: ['Invalid token']
      })
    }

    // Only the address owner should be able to revoke a token
    if (tokenData.address.toLowerCase() !== user.address.toLowerCase()) {
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

    // Blacklist the token
    try {
      await tokenBlacklist.revokeToken(token, user.address, 'Revoked')
    } catch (err) {
      logger.error('Failed to revoke token', err)
      return res.status(500).send({
        success: false,
        errors: ['Failed to revoke token']
      })
    }

    return res.status(200).send({
      success: true
    })
  }
)

module.exports = router
