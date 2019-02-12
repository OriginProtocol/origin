'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthReward = sequelize.define(
    'GrowthReward',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      status: DataTypes.ENUM(enums.GrowthRewardStatuses),
      ethAddress: DataTypes.STRING,
      campaignId: DataTypes.INTEGER,
      campaignLevel: DataTypes.INTEGER,
      campaignRule: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      currency: DataTypes.STRING
    },
    {
      tableName: 'growth_reward'
    }
  )

  return GrowthReward
}
