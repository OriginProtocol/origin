'use strict'

const pick = require('lodash/pick')

const verifyToken = require('../utils/verify-token')

const logger = require('../logger')

/**
 * IMPORTANT: This is same as `auth.js` but less strict.
 * Even if there is no authorization, it allows the request to continue.
 * This is to be used only in notifications server and REMOVED as soon as possible
 */
const authMiddleware = async (req, res, next) => {
  logger.warn('Using non-strict middleware')

  if (!req.headers || !req.headers.authorization) {
    logger.error('Trying to access without authorization header', req.ip)

    req.__originAuth = {
      // If there is any address on body or query param,
      // Consider that as user's address
      address: req.body.eth_address || req.query.eth_address
    }

    return next()
  }

  const [type, token] = req.headers.authorization.split(' ')

  if (type !== 'Bearer') {
    logger.debug('Invalid token type', type)
    return res.status(401).send({
      errors: [`Expected 'Bearer' token but got '${type}'`]
    })
  }

  try {
    const data = await verifyToken(token)

    if (!data) {
      logger.debug('Invalid token', token)
      return res.status(401).send({
        errors: ['Invalid token']
      })
    }

    // Pass down the data if it is needed for the other services
    req.__originAuth = pick(data, ['address', 'expiresAt', 'issuedAt'])

    next()
  } catch (err) {
    logger.error('Failed to verify auth token', err)
    return res.status(401).send({
      errors: [err.message]
    })
  }
}

module.exports = authMiddleware
