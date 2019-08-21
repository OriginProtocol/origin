const Web3 = require('web3')
const totp = require('notp').totp

const { ip2geo } = require('@origin/ip2geo')

const { Account } = require('./models')
const { unlockDate } = require('./config')
const { checkTransferRequest } = require('./lib/transfer')
const { decrypt } = require('./lib/crypto')

/**
 * Allows use of async functions for an Express route.
 */
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const isEthereumAddress = value => {
  if (!Web3.utils.isAddress(value)) {
    throw new Error('Address is not a valid Ethereum address')
  }
  return true
}

const isExistingAddress = (value, { req }) => {
  return Account.findOne({
    where: {
      userId: req.user.id,
      address: value
    }
  }).then(account => {
    if (account) {
      throw new Error('Address already exists')
    }
    return true
  })
}

const isExistingNickname = (value, { req }) => {
  return Account.findOne({
    where: {
      userId: req.user.id,
      nickname: value
    }
  }).then(account => {
    if (account) {
      throw new Error('Nickname already exists')
    }
    return true
  })
}

const hasBalance = (value, { req }) => {
  return checkTransferRequest(req.user.id, value)
}

// Use a function so that this value can be mocked in tests
const getUnlockDate = () => {
  return unlockDate
}

const getFingerprintData = async req => {
  // Parsed user agent from express-useragent
  const device = req.useragent
  return {
    ip: req.connection.remoteAddress,
    device: {
      source: device.source,
      browser: device.browser,
      isMobile: device.isMobile,
      isDesktop: device.isDesktop,
      platform: device.platform,
      version: device.version,
      os: device.os
    },
    location: await ip2geo(req.connection.remoteAddress)
  }
}

const isValidTotp = (value, { req }) => {
  if (!req.user.otpVerified) {
    throw new Error('No 2fa configured')
  }
  if (!totp.verify(value, decrypt(req.user.otpKey))) {
    throw new Error('Invalid 2fa value')
  }
  return true
}

module.exports = {
  asyncMiddleware,
  isEthereumAddress,
  isExistingAddress,
  isExistingNickname,
  isValidTotp,
  getFingerprintData,
  getUnlockDate,
  hasBalance
}
