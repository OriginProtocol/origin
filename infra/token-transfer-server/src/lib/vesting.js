'use strict'

const moment = require('moment')
const BigNumber = require('bignumber.js')

function toMoment(date) {
  if (!date) return date
  if (!moment.isMoment()) return moment(date)
  return date
}

/* Convert the dates of a grant object to moments.
 *
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

/**
 * Returns the vesting schedule for the grant. The vesting schedule is just an
 * array of integers representing a vested amount. The date/time associated with
 * each vesting event is not calculated.
 */
function vestingEvents(grantObj) {
  const grant = momentizeGrant(grantObj)

  const vestingEventCount = grant.end.diff(grant.start, grant.interval)
  const vestedPerEvent = BigNumber(grant.amount).div(vestingEventCount)
  const cliffVestingCount = grant.cliff.diff(grant.start, grant.interval)

  const cliffVestAmount = Math.floor(vestedPerEvent.times(cliffVestingCount))
  const remainingVestingCount = vestingEventCount - cliffVestingCount
  const remainingVestingAmounts = Array(remainingVestingCount).fill(
    Math.floor(vestedPerEvent)
  )

  const vestingEvents = [cliffVestAmount, ...remainingVestingAmounts]
  const roundingError = grant.amount - vestingEvents.reduce((a, b) => a + b, 0)
  vestingEvents[vestingEvents.length - 1] += roundingError

  return vestingEvents
}

/* Returns an array of vesting objects that include a datetime and status
 * associated with each vesting event.
 */
function vestingSchedule(grantObj, start = null, end = null) {
  const now = grantObj.now || moment()
  const grant = momentizeGrant(grantObj)

  return vestingEvents(grant).map((currentVestingEvent, index) => {
    const vestingEventDate = grant.cliff.clone()
    if (index > 0) {
      vestingEventDate.add(index, grant.interval)
    }
    return {
      amount: currentVestingEvent,
      date: vestingEventDate,
      vested: vestingEventDate < now
    }
  })
}

/* Returns the number of tokens vested by a grant.
 *
 */
function vestedAmount(grantObj) {
  const now = grantObj.now || moment()
  const grant = momentizeGrant(grantObj)

  if (now < grant.cliff) {
    return 0
  } else if (now > grant.end) {
    return grant.amount
  } else {
    // Number of vesting events that have occurred since the cliff determines
    // the index of the array for calculating events that have already vested
    const threshold = now.diff(grant.cliff, grant.interval)
    // Buld array of already vested amounts
    const vested = vestingEvents(grant).slice(0, threshold + 1)
    return vested.length ? Math.round(BigNumber.sum(...vested)) : 0
  }
}

module.exports = { momentizeGrant, vestingEvents, vestingSchedule, vestedAmount }
