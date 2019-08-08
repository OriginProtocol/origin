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
  return Grant
}
