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
      if (
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

function transferHasExpired(transfer) {
  return (
    moment().diff(moment(transfer.createdAt), 'minutes') >=
    transferConfirmationTimeout
  )
}

function lockupHasExpired(lockup) {
  return (
    moment().diff(moment(lockup.createdAt), 'minutes') >=
    lockupConfirmationTimeout
  )
}

// Unlock dates, if undefined assume tokens are locked with an unknown unlock
// date
const employeeUnlockDate = moment(
  process.env.EMPLOYEE_UNLOCK_DATE,
  'YYYY-MM-DD'
).isValid()
  ? moment.utc(process.env.EMPLOYEE_UNLOCK_DATE)
  : undefined

const investorUnlockDate = moment(
  process.env.INVESTOR_UNLOCK_DATE,
  'YYYY-MM-DD'
).isValid()
  ? moment.utc(process.env.INVESTOR_UNLOCK_DATE)
  : undefined

// Lockup bonus rate as a percentage
const lockupBonusRate = process.env.LOCKUP_BONUS_RATE || 10

// Lockup duration in months
const lockupDuration = process.env.LOCKUP_DURATION || 12

const earnOgnEnabled = process.env.EARN_OGN_ENABLED || false

const transferConfirmationTimeout =
  process.env.TRANSFER_CONFIRMATION_TIMEOUT || 5

const lockupConfirmationTimeout = process.env.LOCKUP_CONFIRMATION_TIMEOUT || 5

module.exports = {
  calculateGranted,
  calculateVested,
  calculateUnlockedEarnings,
  calculateEarnings,
  calculateLocked,
  calculateWithdrawn,
  earnOgnEnabled,
  toMoment,
  momentizeLockup,
  momentizeGrant,
  employeeUnlockDate,
  investorUnlockDate,
  lockupHasExpired,
  lockupBonusRate,
  lockupDuration,
  lockupConfirmationTimeout,
  transferHasExpired,
  transferConfirmationTimeout
}
