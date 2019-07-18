'use strict'

const BigNumber = require('bignumber.js')
const moment = require('moment')

// Avoid valueOf coercion
BigNumber.prototype.valueOf = function () {
  throw Error('valueOf called!')
}

module.exports = (sequelize, DataTypes) => {
  const Grant = sequelize.define(
    'Grant',
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      start: { type: DataTypes.DATE, allowNull: false },
      end: { type: DataTypes.DATE, allowNull: false },
      cliff: { type: DataTypes.DATE, allowNull: false },
      cancelled: { type: DataTypes.DATE },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      interval: {
        type: DataTypes.ENUM([
          'years',
          'months',
          'weeks',
          'days',
          'hours',
          'minutes',
          'seconds'
        ]),
        allowNull: false
      }
    },
    {}
  )

  /**
   * Returns the vesting schedule for this grant
   */
  Grant.prototype.vestingSchedule = function() {
    const now = this.now || moment()

    const vestingSchedule = []
    if (now < this.cliff) {
      return vestingSchedule
    }

    const vestingEventCount = moment(this.end).diff(this.start, this.interval)
    const cliffVestingCount = moment(this.cliff).diff(this.start, this.interval)
    const vestedPerEvent = BigNumber(this.amount).div(vestingEventCount)

    // Add the cliff vest
    vestingSchedule.push({
      datetime: moment(this.cliff),
      amount: vestedPerEvent.times(cliffVestingCount)
    })

    // Generate an array of all remaining vesting events
    const remainingVestingEventCount = vestingEventCount - cliffVestingCount
    const remainingVestingEvents = Array.from({ length: remainingVestingEventCount })
      .map((v, i) => {
        return {
          datetime: moment(this.cliff).add(i + 1, this.interval),
          amount: vestedPerEvent
        }
      })

    // Add all remaining vesting events
    return vestingSchedule.concat(remainingVestingEvents)
  }

  // Returns current number of vested tokens for this grant
  Grant.prototype.calculateVested = function() {
    const now = this.now || moment()

    const vested = this.vestingSchedule().reduce((total, vestingEvent) => {
      return total.plus(now >= vestingEvent.datetime ? vestingEvent.amount : BigNumber(0))
    }, BigNumber(0))

    return vested
  }

  return Grant
}
