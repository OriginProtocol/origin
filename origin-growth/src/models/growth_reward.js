'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthReward = sequelize.define(
    'GrowthReward',
    {
      status: DataTypes.ENUM(enums.GrowthRewardStatuses),
      ethAddress: DataTypes.STRING,
      campaignId: DataTypes.INTEGER,
      levelId: DataTypes.INTEGER,
      ruleId: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      currency: DataTypes.STRING,
      txnHash: DataTypes.STRING
    },
    {
      tableName: 'growth_reward'
    }
  )

  return GrowthReward
}
