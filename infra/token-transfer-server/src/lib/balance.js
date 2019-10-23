const BigNumber = require('bignumber.js')
const moment = require('moment')

const { vestedAmount } = require('./vesting')
const { Grant, Lockup, Transfer, User } = require('../models')
const logger = require('../logger')
const enums = require('../enums')

/* Calculate the amount of vested tokens for an array of grants
 * @param grants
 */
function calculateVestedFromGrants(grants) {
  return grants.reduce((total, grant) => {
    return total.plus(vestedAmount(grant.get({ plain: true })))
  }, BigNumber(0))
}

/* Calculate the unlocked earnings from an array of lockups. Tokens earned
 * through lockups are earned immediately but they remain locked until the
 * end of the lockup period.
 * @param lockups
 */
function calculateUnlockedEarnings(lockups) {
  return lockups.reduce((total, lockup) => {
    if (lockup.end <= moment.utc()) {
      const earnings = BigNumber(lockup.amount)
        .times(lockup.bonusRate)
        .div(BigNumber(100))
      return total.plus(earnings)
    }
    return total
  }, BigNumber(0))
}

/* Calculate the total earnings from an array of lockups. This includes both
 * tokens that are available with withdrawal and tokens that the user has but
 * are still locked by the lockup period.
 * @param lockups
 */
function calculateEarnings(lockups) {
  return lockups.reduce((total, lockup) => {
    const earnings = BigNumber(lockup.amount)
      .times(lockup.bonusRate)
      .div(BigNumber(100))
    return total.plus(earnings)
  }, BigNumber(0))
}

/* Calculate tokens that are locked by lockups.
 * @param lockups
 */
function calculateLocked(lockups) {
  return lockups.reduce((total, lockup) => {
    if (lockup.end > moment.utc()) {
      return total.plus(BigNumber(lockup.amount))
    }
    return total
  }, BigNumber(0))
}

/* Calculate the amount of tokens that have been withdrawn or are in flight in
 * a withdrawal.
 * @param transfers
 */
function calculateWithdrawn(transfers) {
  // Sum the amount from transfers that are in a pending or success state
  const pendingOrCompleteTransfers = [
    enums.TransferStatuses.WaitingEmailConfirm,
    enums.TransferStatuses.Enqueued,
    enums.TransferStatuses.Paused,
    enums.TransferStatuses.WaitingConfirmation,
    enums.TransferStatuses.Success
  ]

  return transfers.reduce((total, transfer) => {
    if (pendingOrCompleteTransfers.includes(transfer.status)) {
      return total.plus(BigNumber(transfer.amount))
    }
    return total
  }, BigNumber(0))
}

/**
 * Helper method to check if a user has balance available for adding a transfer
 * or a lockup.
 *
 * Throws an exception in case the request is invalid.
 *
 * @param userId
 * @param amount
 * @returns Promise<User>
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

  // Sum the vested tokens for all of the users grants
  const vested = calculateVestedFromGrants(user.Grants)
  logger.info('Vested tokens', vested.toString())
  // Sum the unlocked tokens from lockup earnings
  const lockupEarnings = calculateUnlockedEarnings(user.Lockups)
  logger.info('Unlocked earnings from lockups', lockupEarnings.toString())
  // Sum amount withdrawn or pending in transfers
  const transferWithdrawnAmount = calculateWithdrawn(user.Transfers)
  logger.info(
    'Pending or transferred tokens',
    transferWithdrawnAmount.toString()
  )
  // Sum locked by lockups
  const lockedAmount = calculateLocked(user.Lockups)
  logger.info('Tokens in lockup', lockedAmount.toString())

  // Calculate total available tokens
  const available = vested
    .plus(lockupEarnings)
    .minus(transferWithdrawnAmount)
    .minus(lockedAmount)

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

module.exports = {
  calculateEarnings,
  hasBalance
}
