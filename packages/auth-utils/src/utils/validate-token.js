'use strict'

const pick = require('lodash/pick')

const verifyToken = require('../utils/verify-token')

const logger = require('../logger')

/**
 * Validates a token from a request header and returns respective token
 *
 * @param {Object} req Request Object
 * @param {String} authorization value of Authorization header
 */
const validateToken = async req => {
  if (!req.headers || !req.headers.authorization) {
    logger.debug('Trying to access without authorization header', req.ip)
    return {
      errors: ['Authorization required']
    }
  }

  const [type, token] = req.headers.authorization.split(' ')

  if (type !== 'Bearer') {
    logger.debug('Invalid token type', type)
    return {
      errors: [`Expected 'Bearer' token but got '${type}'`]
    }
  }

  try {
    const data = await verifyToken(token)

    if (!data) {
      logger.debug('Invalid token', token)
      return {
        errors: ['Invalid token']
      }
    }

    return {
      success: true,
      // Pass down the data if it is needed for the other services
      authData: pick(data, ['address', 'expiresAt', 'issuedAt'])
    }
  } catch (err) {
    logger.error('Failed to verify auth token', err)
    return {
      errors: [err.message]
    }
  }
}

module.exports = validateToken
