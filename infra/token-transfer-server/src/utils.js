const AsyncLock = require('async-lock')

const { ip2geo } = require('@origin/ip2geo')

const {
  earlyLockupsEnabled,
  lockupsEnabled,
  otcRequestEnabled,
  unlockDate
} = require('./config')

const lock = new AsyncLock()

/**
 * Allows use of async functions for an Express route.
 */
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Use a function so that this value can be mocked in tests
const getUnlockDate = () => {
  return unlockDate
}

// Use a function so that this value can be mocked in tests
const getLockupsEnabled = () => {
  return lockupsEnabled === true || lockupsEnabled === 'true'
}

// Use a function so that this value can be mocked in tests
const getEarlyLockupsEnabled = () => {
  return earlyLockupsEnabled === true || earlyLockupsEnabled === 'true'
}

// Use a function so that this value can be mocked in tests
const getOtcRequestEnabled = () => {
  return otcRequestEnabled === true || otcRequestEnabled === 'true'
}

// Get fingerprint data about the current device
const getFingerprintData = async req => {
  // Parsed user agent from express-useragent
  const device = req.useragent
  return {
    ip: req.headers['x-real-ip'] || req.headers['x-forwarded-for'],
    device: {
      source: device.source,
      browser: device.browser,
      isMobile: device.isMobile,
      isDesktop: device.isDesktop,
      platform: device.platform,
      version: device.version,
      os: device.os
    },
    location: await ip2geo(
      req.headers['x-real-ip'] || req.headers['x-forwarded-for']
    )
  }
}

module.exports = {
  asyncMiddleware,
  getLockupsEnabled,
  getEarlyLockupsEnabled,
  getFingerprintData,
  getOtcRequestEnabled,
  getUnlockDate,
  lock
}
