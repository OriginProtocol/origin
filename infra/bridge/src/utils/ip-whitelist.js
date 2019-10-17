'use strict'

const ipaddr = require('ipaddr.js')

const logger = require('../logger')

// Refer this for in case the subnets are changed: https://core.telegram.org/bots/api
const telegramSubnets = (process.env.TELEGRAM_SUBNETS || '')
  .split(',')
  .filter(subnet => subnet)
  .map(subnet => ipaddr.parseCIDR(subnet))

/**
 * A middleware that forwards requests only if it
 * they are under the given IP subnets
 */
const telegramIPWhitelistMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    // Skip whitelisting on test environment
    return next()
  }

  if (!telegramSubnets.length) {
    logger.error('IP subnet whitelist is empty')
    return next()
  }

  const requestIP =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress

  logger.debug('Received telegram update from IP', requestIP)

  try {
    const _ip = ipaddr.parse(requestIP)

    const allowed = telegramSubnets.some(subnet => _ip.match(subnet))

    if (!allowed) {
      logger.error('IP not in any subnet', req.ip)
      return res.status(400).send({
        errors: ['IP not whitelisted']
      })
    }
  } catch (err) {
    logger.error('Failed to check IP', err)
    if (process.env.TELEGRAM_SUBNET_IGNORE_ERROR === 'true') {
      // Just a means to disable this temporarily
      // without doing another deploy
      logger.warn('Ignoring the error and allowing the update to be processed')
    } else {
      return res.status(500).send({
        errors: ['Something went wrong']
      })
    }
  }

  next()
}

module.exports = telegramIPWhitelistMiddleware
