// Code shared between token-transfer-client and token-transfer-server
// The imports in here should be kept as minimal as possible to avoid issues
// with webpack building and node

const BigNumber = require('bignumber.js')
const moment = require('moment')

const {
  vestingSchedule,
  vestedAmount,
  toMoment,
  momentizeGrant
} = require('./lib/vesting')
const enums = require('./enums')

// Length of time in minutes user has to confirm a transfer by clicking the email
// link
const transferConfirmationTimeout =
  process.env.TRANSFER_CONFIRMATION_TIMEOUT || 5

// Length of time in minutes user has to confirm a lockup by clicking the email
// link
const lockupConfirmationTimeout = process.env.LOCKUP_CONFIRMATION_TIMEOUT || 10

/* Convert the dates of a lockup object to moments.
 */
function momentizeLockup(lockup) {
  return {
    ...lockup,
    start: toMoment(lockup.start),
    end: toMoment(lockup.end)
  }
}

/* Calculate the amount of tokens for an array of grants
 * @param grants
 */
function calculateGranted(grants) {
  return grants.reduce((total, grant) => {
    return total.plus(grant.amount)
  }, BigNumber(0))
}

/* Calculate the amount of vested tokens for an array of grants
 * @param grants
 */
function calculateVested(user, grants) {
  return grants.reduce((total, grant) => {
    if (grant.dataValues) {
      // Convert if instance of sequelize model
      grant = grant.get({ plain: true })
    }
    return total.plus(vestedAmount(user, grant))
  }, BigNumber(0))
}

/* Calculate the unlocked earnings from an array of lockups. Tokens earned
 * through lockups are earned immediately but they remain locked until the
 * end of the lockup period.
 * @param lockups
 */
function calculateUnlockedEarnings(lockups) {
  return lockups.reduce((total, lockup) => {
    if (lockup.confirmed && lockup.end <= moment.utc()) {
      const earnings = BigNumber(lockup.amount)
        .times(lockup.bonusRate)
        .div(BigNumber(100))
        .toFixed(0, BigNumber.ROUND_HALF_UP)
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
    if (lockup.confirmed) {
      const earnings = BigNumber(lockup.amount)
        .times(lockup.bonusRate)
        .div(BigNumber(100))
        .toFixed(0, BigNumber.ROUND_HALF_UP)
      return total.plus(earnings)
    }
    return total
  }, BigNumber(0))
}

/* Calculate tokens that are locked by lockups.
 * @param lockups
 */
function calculateLocked(lockups) {
  return lockups.reduce((total, lockup) => {
    if (
      lockup.start < moment.utc() && // Lockup has started
      lockup.end > moment.utc() // Lockup has not yet ended
    ) {
      return total.plus(BigNumber(lockup.amount))
    }
    return total
  }, BigNumber(0))
}

/* Determine if a lockup is a nearly lockup based
 */
const isEarlyLockup = lockup => {
  return !!(lockup.data && lockup.data.vest && lockup.data.vest.grantId)
}

/* Calculate tokens from the next vest that are locked due to early lockups.
 * @param lockups
 */
function calculateNextVestLocked(lockups) {
  return lockups.reduce((total, lockup) => {
    // Assume every early lockup with a recorded vest date in the future is
    // attributable to the next vest
    if (
      isEarlyLockup(lockup) &&
      moment.utc(lockup.data.vest.date) > moment.utc()
    ) {
      return total.plus(BigNumber(lockup.amount))
    }
    return total
  }, BigNumber(0))
}

/* Get the next vest for a user.
 * @param grants
 * @param user
 */
function getNextVest(grants, user) {
  // Flat map implementation, can remove in node >11
  const flatMap = (a, cb) => [].concat(...a.map(cb))
  const allGrantVestingSchedule = flatMap(grants, grant => {
    return vestingSchedule(user, grant)
  })
  const sortedUnvested = allGrantVestingSchedule
    .filter(v => !v.vested)
    .sort((a, b) => a.date - b.date)
  return sortedUnvested.length > 0 ? sortedUnvested[0] : null
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
    enums.TransferStatuses.Success,
    enums.TransferStatuses.Processing
  ]

  return transfers.reduce((total, transfer) => {
    if (pendingOrCompleteTransfers.includes(transfer.status)) {
      if (
        // Handle the case where a transfer is still awaiting email confirmation
        // but has expired
        transfer.status === enums.TransferStatuses.WaitingEmailConfirm &&
        transferHasExpired(transfer)
      ) {
        return total
      } else {
        return total.plus(BigNumber(transfer.amount))
      }
    }
    return total
  }, BigNumber(0))
}

// Helper function to determine if a transfer has expired, i.e. the user did
// not click the email link within the configured timeout
function transferHasExpired(transfer) {
  return (
    moment().diff(moment(transfer.createdAt), 'minutes') >=
    transferConfirmationTimeout
  )
}

// Helper function to determine if a transfer has expired, i.e. the user did
// not click the email link within the configured timeout
function lockupHasExpired(lockup) {
  return (
    moment().diff(moment(lockup.createdAt), 'minutes') >=
    lockupConfirmationTimeout
  )
}

module.exports = {
  calculateGranted,
  calculateVested,
  calculateUnlockedEarnings,
  calculateEarnings,
  calculateLocked,
  calculateNextVestLocked,
  calculateWithdrawn,
  getNextVest,
  toMoment,
  momentizeLockup,
  momentizeGrant,
  lockupHasExpired,
  transferHasExpired,
  lockupConfirmationTimeout,
  transferConfirmationTimeout
}
