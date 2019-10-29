const express = require('express')
const router = express.Router()

const verifySign = require('../utils/verify-sign')
const generateToken = require('../utils/generate-token')
const verifyToken = require('../utils/verify-token')
const revokeToken = require('../utils/revoke-token')

const authMiddleware = require('../middlewares/auth')

const logger = require('../logger')

const {
  generateTokenValidation,
  revokeTokenValidation
} = require('../utils/validation')

/**
 * To check the validity of a token
 *
 * @returns {Boolean} result.success - true if token is valid and has not expired
 */
router.get('/', authMiddleware, async (req, res) => {
  if (req.__originAuth) {
    return res.status(200).send({
      success: true
    })
  }

  return res.status(401).send({
    success: false
  })
})

/**
 * Validates the signature and generates a new token for the user
 *
 * @returns {Boolean} result.success = true if token generated successfully.
 * @returns {String} result.authToken = The authToken to be used for authorization
 * @returns {Number} result.expiresAt = Timestamp of token expiration date
 * @returns {Number} result.issuedAt = Timestamp of token issued date
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

  const tokenData = await generateToken({
    address,
    signature,
    payload,
    ip: req.ip
  })

  if (!tokenData) {
    return res.status(500).send({
      success: false,
      errors: ['Failed to generate auth token']
    })
  }

  return res.status(201).send({
    ...tokenData,
    success: true
  })
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

    const tokenData = await verifyToken(token, true)

    // Make sure token is valid one
    if (!tokenData) {
      return res.status(404).send({
        success: false,
        errors: ['Invalid token']
      })
    }

    // Only the address owner should be able to revoke a token
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

    // Blacklist the token
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
  }
)

module.exports = router
