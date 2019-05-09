'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthPayout = sequelize.define(
    'GrowthPayout',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      status: DataTypes.ENUM(enums.GrowthPayoutStatuses),
      fromAddress: DataTypes.STRING,
      toAddress: DataTypes.STRING,
      campaignId: DataTypes.INTEGER,
      amount: DataTypes.DECIMAL,
      currency: DataTypes.STRING,
      txnHash: DataTypes.STRING
    },
    {
      tableName: 'growth_payout'
    }
  )

  return GrowthPayout
}
