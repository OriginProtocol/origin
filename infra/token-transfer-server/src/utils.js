const { ip2geo } = require('@origin/ip2geo')

const { unlockDate } = require('./config')
const { earnOgnEnabled } = require('./shared')

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
const getEarnOgnEnabled = () => {
  return earnOgnEnabled
}

// Get fingerprint data about the current device
const getFingerprintData = async req => {
  // Parsed user agent from express-useragent
  const device = req.useragent
  return {
    ip: req.headers['x-real-ip'],
    device: {
      source: device.source,
      browser: device.browser,
      isMobile: device.isMobile,
      isDesktop: device.isDesktop,
      platform: device.platform,
      version: device.version,
      os: device.os
    },
    location: await ip2geo(req.headers['x-real-ip'])
  }
}

module.exports = {
  asyncMiddleware,
  getEarnOgnEnabled,
  getFingerprintData,
  getUnlockDate
}
