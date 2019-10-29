'use strict'

const jwt = require('jsonwebtoken')
const logger = require('../logger')

const { Sequelize, AuthTokenBlacklist } = require('../models')
const { getbitAsync, setbitAsync, redisClient } = require('./redis')

/**
 * To check if token is blacklisted or revoked
 *
 * @param {String} authToken Token to verify
 * @returns {Boolean} true if token is blacklisted
 */
const isBlacklisted = async authToken => {
  const key = 'authtokens/' + authToken + '/revoked'
  const revoked = await getbitAsync(key, 0)

  if (revoked === 1) {
    // Cache hit
    return true
  }

  const monthAgo = Date.now() - 1000 * 60 * 60 * 24 * 30

  const entry = await AuthTokenBlacklist.findOne({
    where: {
      authToken,
      createdAt: {
        // Only search the tokens blacklisted in the last month
        [Sequelize.Op.gt]: monthAgo
      }
    }
  })

  // Cache the result for a day
  await setbitAsync(key, 0, entry ? 1 : 0)
  redisClient.expire(key, 86400)

  if (!entry) {
    return false
  }

  logger.debug('Tried to use blacklisted token ', authToken)
  return true
}

/**
 * Verifies the validity of a token
 *
 * @param {String} authToken Token to verify
 * @param {Boolean} skipBlacklistCheck Skips running the token against the blacklist, if true
 * @returns {Boolean} true if `signature` is signed by `address` on `payload` in the last 30 days; false otherwise
 */
const verifyToken = async (authToken, skipBlacklistCheck) => {
  try {
    if (!skipBlacklistCheck) {
      if (await isBlacklisted(authToken)) {
        return false
      }
    }

    return jwt.verify(authToken, process.env.JWT_SECRET, {
      maxAge: process.env.JWT_EXPIRE_IN || '30 days'
    })
  } catch (err) {
    logger.error('Failed to verify token', err)
  }

  return null
}

module.exports = verifyToken
