'use strict'

const Web3Utils = require('web3-utils')

const { AuthTokenBlacklist } = require('../models')

const { decryptPayload } = require('../helpers')

const logger = require('../logger')

/**
 * Checks if token is in blacklist
 * @param {String} authToken token to check
 * @returns {Promise<Boolean>} true if in blacklist; false otherwise
 */
const isBlacklisted = async token => {
  const entry = await AuthTokenBlacklist.findOne({
    where: {
      authToken: token
    }
  })

  return entry ? true : false
}

/**
 * Adds token to blacklist
 *
 * @param {String} authToken token to blacklist
 * @param {String} revokedBy Address of user revoking the token
 * @param {String} reason Reason for blacklisting
 *
 * @returns {Promise<Boolean>} true if successful; throws otherwise
 */
const revokeToken = async (authToken, revokedBy, reason) => {
  if (!authToken) {
    throw new Error('`authToken` is required')
  }

  if (!Web3Utils.isHex(authToken)) {
    throw new Error('`authToken` is not in valid format')
  }

  try {
    decryptPayload(authToken)
  } catch (err) {
    logger.debug('Invalid auth token for revoke', err)
    throw new Error('Invalid auth token')
  }

  try {
    await AuthTokenBlacklist.create({
      authToken,
      revokedBy: revokedBy.toLowerCase(),
      reason: reason || ''
    })
  } catch (err) {
    logger.debug('Failed to revoke auth token', err)
    throw new Error('Failed to revoke auth token')
  }

  return true
}

module.exports = {
  isBlacklisted,
  revokeToken
}
