'use strict'

const BigNumber = require('bignumber.js')
const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
  const Grant = sequelize.define(
    'Grant',
    {
      email: { type: DataTypes.TEXT, allowNull: false },
      grantedAt: { type: DataTypes.DATE, allowNull: false },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      totalMonths: { type: DataTypes.INTEGER, allowNull: false },
      cliffMonths: { type: DataTypes.INTEGER, allowNull: false },
      vested: { type: DataTypes.INTEGER, allowNull: false },
      transferred: { type: DataTypes.INTEGER, allowNull: false }
    },
    {}
  )

  /**
   * Returns the vesting schedule for this grant.
   */
  Grant.prototype.vestingSchedule = function() {
    if (this.totalMonths === 0) {
      // One-time immediate grant of tokens
      return []
    }

    const monthlyAmount = BigNumber(this.amount).div(this.totalMonths)
    const cliffAmount = BigNumber(this.cliffMonths)
      .times(this.amount)
      .div(this.totalMonths)

    // Construct monthly vesting schedule.
    const schedule = []
    for (let month = 1; month <= this.totalMonths; month++) {
      if (month < this.cliffMonths) {
        continue
      }
      schedule.push({
        date: moment(this.grantedAt).add(month, 'M'),
        month,
        amount: month == this.cliffMonths ? cliffAmount : monthlyAmount
      })
    }

    // Ensure that the last vesting event makes the total vested amount add up
    // correctly. This is important with grant amounts that don't divide evenly
    // by the total number of months for the grant.
    const scheduledAmountMinusLast = schedule
      .slice(0, schedule.length - 1)
      .reduce((sum, s) => sum.plus(s.amount), BigNumber(0))
    schedule[schedule.length - 1].amount = BigNumber(this.amount).minus(
      scheduledAmountMinusLast
    )

    // Sanity check.
    const scheduledAmount = scheduledAmountMinusLast.plus(
      schedule[schedule.length - 1].amount
    )
    if (scheduledAmount != this.amount) {
      throw new Error(
        `total amount vested ${scheduledAmount} != total ${this.amount}`
      )
    }

    return schedule
  }

  // Returns current number of vested tokens for this grant.
  Grant.prototype.calculateVested = function() {
    const now = this.now || moment()

    if (this.totalMonths === 0) {
      return BigNumber(
        moment(this.grantedAt).isSameOrBefore(now) ? this.amount : 0
      )
    }

    const schedule = this.vestingSchedule()
    let tokensVested = BigNumber(0)
    for (const event of schedule) {
      if (now < event.date) {
        break
      }
      tokensVested = tokensVested.plus(event.amount)
    }
    return tokensVested
  }

  Grant.prototype.nextVesting = function() {
    const schedule = this.vestingSchedule()
    const now = this.now || moment()
    for (const event of schedule) {
      if (now < event.date) {
        return {
          date: event.date.format('YYYY-MM-DD'),
          amount: event.amount.toNumber()
        }
      }
    }
    return null
  }

  return Grant
}
