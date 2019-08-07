'use strict'

const BigNumber = require('bignumber.js')
const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
  const Grant = sequelize.define(
    'Grant',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
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
    {
      tableName: 't3_grant'
    }
  )

  /**
   * Returns the vesting schedule for this grant
   */
  Grant.prototype.vestingSchedule = function() {
    const vestingEventCount = moment(this.end).diff(this.start, this.interval)
    const vestedPerEvent = BigNumber(this.amount).div(vestingEventCount)
    const cliffVestingCount = moment(this.cliff).diff(this.start, this.interval)
    const cliffVestAmount = vestedPerEvent.times(cliffVestingCount)
    const remainingVestingCount = vestingEventCount - cliffVestingCount
    const remainingVestingAmounts = Array(remainingVestingCount).fill(
      vestedPerEvent
    )

    return [cliffVestAmount, ...remainingVestingAmounts]
  }

  // Returns current number of vested tokens for this grant
  Grant.prototype.calculateVested = function() {
    const now = this.now || moment()
    if (now < this.cliff) {
      return 0
    } else if (now > this.end) {
      return this.amount
    } else {
      // Number of vesting events that have occurred since the cliff determines
      // the index of the array for calculating events that have already vested
      const threshold = moment(now).diff(this.cliff, this.interval)
      // Buld array of already vested amounts
      const vested = this.vestingSchedule().slice(0, threshold + 1)
      return vested.length ? Math.round(BigNumber.sum(...vested)) : 0
    }
  }

  return Grant
}
