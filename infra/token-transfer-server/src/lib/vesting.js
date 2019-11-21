'use strict'

const moment = require('moment')
const BigNumber = require('bignumber.js')

function toMoment(date) {
  if (!date) return date
  if (!moment.isMoment()) return moment.utc(date)
  return date
}

/* Convert the dates of a grant object to moments.
 */
function momentizeGrant(grant) {
  return {
    ...grant,
    start: toMoment(grant.start),
    end: toMoment(grant.end),
    cliff: toMoment(grant.cliff),
    cancelled: toMoment(grant.cancelled)
  }
}

/* Returns an array of vesting objects that include a datetime and status
 * associated with each vesting event.
 */
function vestingSchedule(user, grantObj) {
  return user.employee
    ? employeeVestingSchedule(grantObj)
    : investorVestingSchedule(grantObj)
}

function employeeVestingSchedule(grantObj) {
  const grant = momentizeGrant(grantObj)

  const vestingEventCount = grant.end.diff(grant.start, 'months')
  const cliffVestingCount = grant.cliff.diff(grant.start, 'months')
  const cliffVestAmount = BigNumber(grant.amount)
    .times(cliffVestingCount)
    .div(vestingEventCount)
    .integerValue(BigNumber.ROUND_FLOOR)

  // Calculate the amount vested per remaining event
  const vestedPerEvent = BigNumber(grant.amount)
    .minus(cliffVestAmount)
    .div(vestingEventCount - cliffVestingCount)

  // Calculate the value for the remaining vesting amount and fill an array
  // with length of the number of remaining vesting events with that value
  const remainingVestingCount = vestingEventCount - cliffVestingCount
  const remainingVestingAmounts = Array(remainingVestingCount).fill(
    vestedPerEvent.integerValue(BigNumber.ROUND_FLOOR)
  )

  // Complete vesting array
  const vestingEvents = [cliffVestAmount, ...remainingVestingAmounts]

  // Add an rounding errors to the last vesting event
  const roundingError = BigNumber(grant.amount).minus(
    vestingEvents.reduce((a, b) => a.plus(b), BigNumber(0))
  )
  vestingEvents[vestingEvents.length - 1] = vestingEvents[
    vestingEvents.length - 1
  ].plus(roundingError)

  const events = vestingEvents.map((currentVestingEvent, index) => {
    const vestingDate = grant.cliff.clone()
    if (index > 0) {
      vestingDate.add(index, 'months')
    }
    return {
      amount: currentVestingEvent,
      date: vestingDate.clone(),
      vested: hasVested(vestingDate, grant)
    }
  })
  return events
}

function investorVestingSchedule(grantObj) {
  const grant = momentizeGrant(grantObj)

  const vestingSchedule = []

  // Calculate initial vest percentage granted on grant start date
  const initialVestPercentage = 6
  const initialVestAmount = BigNumber(grant.amount)
    .times(initialVestPercentage)
    .div(100)
    .integerValue(BigNumber.ROUND_FLOOR)

  // Time after which regular quarterly vesting begins
  const quarterlyVestDelayMonths = 4
  const quarterlyVestingPercentage = (100 - initialVestPercentage) / 8
  const quarterlyVestAmount = BigNumber(grant.amount)
    .times(quarterlyVestingPercentage)
    .div(100)
    .integerValue(BigNumber.ROUND_FLOOR)

  // Rounding error caused by ROUND_FLOOR over total grant which should be added to the final vesting
  // event
  const roundingError = BigNumber(grant.amount).minus(
    quarterlyVestAmount.times(8).plus(initialVestAmount)
  )
  const adjustedFinalVest = quarterlyVestAmount.plus(roundingError)

  // Add initial vest
  vestingSchedule.push({
    amount: initialVestAmount,
    date: grant.start.clone(),
    vested: hasVested(grant.start, grantObj)
  })

  const vestingDate = grant.start.clone()
  // Iterate over quarterly vests and push
  for (let i = 0; i < 8; i++) {
    if (i === 0) {
      // Add initial delay to vesting fdate
      vestingDate.add(quarterlyVestDelayMonths, 'months')
    } else {
      // Add quarter of a year to the last vesting date
      vestingDate.add(3, 'months')
    }
    vestingSchedule.push({
      amount: i === 7 ? adjustedFinalVest : quarterlyVestAmount,
      date: vestingDate.clone(),
      vested: hasVested(vestingDate, grant)
    })
  }

  return vestingSchedule
}

function hasVested(vestingDate, grant) {
  const now = moment.utc()
  return (
    vestingDate <= now && (!grant.cancelled || grant.cancelled >= vestingDate)
  )
}

/* Returns the number of tokens vested by a grant.
 *
 */
function vestedAmount(user, grantObj) {
  return vestingSchedule(user, grantObj)
    .filter(v => v.vested)
    .reduce((total, vestingEvent) => {
      return total.plus(BigNumber(vestingEvent.amount))
    }, BigNumber(0))
}

module.exports = {
  momentizeGrant,
  toMoment,
  vestingSchedule,
  vestedAmount
}
