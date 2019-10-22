const BigNumber = require('bignumber.js')
const moment = require('moment')
const { ip2geo } = require('@origin/ip2geo')

const { unlockDate } = require('./config')
const { Lockup, Grant, Transfer, User } = require('./models')
const { vestedAmount } = require('./lib/vesting')
const enums = require('./enums')
const logger = require('./logger')

/**
 * Allows use of async functions for an Express route.
 */
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Helper method to check if a user has balance available for adding a transfer
 * or a lockup.
 * Throws an exception in case the request is invalid.
 * @param userId
 * @param amount
 * @returns (Promise<User>)
 * @private
 */
async function hasBalance(userId, amount) {
  const user = await User.findOne({
    where: {
      id: userId
    },
    include: [{ model: Grant }, { model: Transfer }, { model: Lockup }]
  })
  // Load the user and check there enough tokens available to fulfill the
  // transfer request
  if (!user) {
    throw new Error(`Could not find specified user id ${userId}`)
  }

  // Sum the amount from transfers that are in a pending or complete state
  const pendingOrCompleteTransfers = [
    enums.TransferStatuses.WaitingEmailConfirm,
    enums.TransferStatuses.Enqueued,
    enums.TransferStatuses.Paused,
    enums.TransferStatuses.WaitingConfirmation,
    enums.TransferStatuses.Success
  ]

  // Sum the vested tokens for all of the users grants
  const vested = user.Grants.map(grant => grant.get({ plain: true })).reduce(
    (total, grant) => {
      return total.plus(vestedAmount(grant))
    },
    BigNumber(0)
  )
  logger.info('Vested tokens', vested.toString())

  const pendingOrCompleteAmount = user.Transfers.reduce((total, transfer) => {
    if (pendingOrCompleteTransfers.includes(transfer.status)) {
      return total.plus(BigNumber(transfer.amount))
    }
    return total
  }, BigNumber(0))

  logger.info(
    'Pending or transferred tokens',
    pendingOrCompleteAmount.toString()
  )

  const lockedAmount = user.Lockups.reduce((total, lockup) => {
    if (lockup.end > moment.now()) {
      return total.plus(BigNumber(lockup.amount))
    }
    return total
  }, BigNumber(0))

  logger.info('Tokens in lockup', lockedAmount.toString())

  const available = vested.minus(pendingOrCompleteAmount).minus(lockedAmount)
  if (amount > available) {
    logger.info(
      `Amount of ${amount} OGN exceeds the ${available} available for user ${user.email}`
    )

    throw new RangeError(
      `Amount of ${amount} OGN exceeds the ${available} available balance`
    )
  }

  return user
}

// Use a function so that this value can be mocked in tests
const getUnlockDate = () => {
  return unlockDate
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
  getFingerprintData,
  getUnlockDate,
  hasBalance
}
