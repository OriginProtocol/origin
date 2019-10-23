'use strict'

const { AuthTokenBlacklist } = require('../models')

const logger = require('../logger')

const { redisClient, setbitAsync } = require('./redis')

const revokeToken = async (authToken, user) => {
  try {
    await AuthTokenBlacklist.create({
      ethAddress: user.address,
      authToken,
      ipAddress: user.ip
    })

    const key = 'authtokens/' + authToken + '/revoked'
    await setbitAsync(key, 0, 1)
    // Let the token expire after a day
    redisClient.expire(authToken, 86400)

    logger.debug('Revoked token ', authToken, user.address, user.ip)

    return true
  } catch (err) {
    logger.error(err)
  }

  return false
}

module.exports = revokeToken
