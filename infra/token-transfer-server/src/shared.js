// Code shared between token-transfer-client and token-transfer-server
// The imports in here should be kept as minimal as possible to avoid issues
// with webpack building and node

const BigNumber = require('bignumber.js')
const moment = require('moment')

const { vestedAmount, toMoment, momentizeGrant } = require('./lib/vesting')
const enums = require('./enums')

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
function calculateVested(grants) {
  return grants.reduce((total, grant) => {
    if (grant.dataValues) {
      // Convert if instance of sequelize model
      grant = grant.get({ plain: true })
    }
    return total.plus(vestedAmount(grant))
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
        .toFixed(0, BigNumber.ROUND_UP)
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
        .toFixed(0, BigNumber.ROUND_UP)
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
      lockup.confirmed &&
      lockup.start < moment.utc() &&
      lockup.end > moment.utc()
    ) {
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

const employeeUnlockDate = process.env.EMPLOYEE_UNLOCK_DATE
  ? moment.utc(process.env.EMPLOYEE_UNLOCK_DATE)
  : moment.utc('2020-01-01')

const investorUnlockDate = process.env.INVESTOR_UNLOCK_DATE
  ? moment.utc(process.env.INVESTOR_UNLOCK_DATE)
  : moment.utc('2019-12-01')

// Lockup bonus rate as a percentage
const lockupBonusRate = process.env.LOCKUP_BONUS_RATE || 10

// Lockup duration in months
const lockupDuration = process.env.LOCKUP_DURATION || 12

module.exports = {
  calculateGranted,
  calculateVested,
  calculateUnlockedEarnings,
  calculateEarnings,
  calculateLocked,
  calculateWithdrawn,
  toMoment,
  momentizeLockup,
  momentizeGrant,
  employeeUnlockDate,
  investorUnlockDate,
  lockupBonusRate,
  lockupDuration
}
