'use strict'

const Web3Utils = require('web3-utils')

const { decryptPayload } = require('../helpers')
const { isBlacklisted } = require('./blacklist')

/**
 * Verifies the validity of a token
 *
 * @param {String} authToken Token to verify
 *
 * @returns {Object} The token data
 */
const verifyToken = async authToken => {
  if (!authToken) {
    throw new Error('`authToken` is required')
  }

  if (!Web3Utils.isHex(authToken)) {
    throw new Error('`authToken` is not in valid format')
  }

  const tokenData = JSON.parse(decryptPayload(authToken))

  const now = Date.now()

  if (tokenData.expiresAt < now) {
    // Expired token
    throw new Error('Token has expired')
  }

  if (await isBlacklisted(authToken)) {
    throw new Error('Token has been revoked')
  }

  return tokenData
}

module.exports = verifyToken
