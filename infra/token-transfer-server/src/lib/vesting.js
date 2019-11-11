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
  const now = moment.utc()

  const vestingEventCount = grant.end.diff(grant.start, 'months')
  const vestedPerEvent = BigNumber(grant.amount).div(vestingEventCount)
  const cliffVestingCount = grant.cliff.diff(grant.start, 'months')

  // Calculate the vesting amount on the cliff
  const cliffVestAmount = vestedPerEvent
    .times(cliffVestingCount)
    .integerValue(BigNumber.ROUND_FLOOR)

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
    const vestingEventDate = grant.cliff.clone()
    if (index > 0) {
      vestingEventDate.add(index, 'months')
    }
    return {
      amount: currentVestingEvent,
      date: vestingEventDate,
      vested: vestingEventDate <= now
    }
  })
  return events
}

function investorVestingSchedule(grantObj) {
  const grant = momentizeGrant(grantObj)
  const now = moment.utc()

  const vestingSchedule = []

  // Calculate initial vest percentage granted on grant start date
  const initialVestPercentage = 6
  // Time after which regular quarterly vesting begins
  const quarterlyVestDelayMonths = 4
  const firstQuarterlyVestDate = grant.start.clone().add(
    quarterlyVestDelayMonths,
    'months'
  )
  const quarterlyVestingPercentage = (100 - initialVestPercentage) / 8
  const quarterlyVestingAmount = BigNumber(grant.amount)
    .times(quarterlyVestingPercentage)
    .div(100)

  // Add initial vest
  vestingSchedule.push({
    amount: BigNumber(grant.amount)
      .times(initialVestPercentage)
      .div(100),
    date: grant.start.clone(),
    vested: grant.start <= now
  })

  // First quarterly vest
  const vestingDate = firstQuarterlyVestDate
  vestingSchedule.push({
    amount: quarterlyVestingAmount,
    date: vestingDate.clone(),
    vested: vestingDate <= now
  })

  // Iterate over remaining quarterly vests and push
  for (let i = 1; i <= 7; i++) {
    // Add quarter of a year to the last vesting date
    vestingDate.add(3, 'months')
    vestingSchedule.push({
      amount: quarterlyVestingAmount,
      date: vestingDate.clone(),
      vested: vestingDate <= now
    })
  }

  return vestingSchedule
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
