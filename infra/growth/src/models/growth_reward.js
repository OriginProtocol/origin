'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthReward = sequelize.define(
    'GrowthReward',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      ethAddress: DataTypes.STRING,
      campaignId: DataTypes.INTEGER,
      ruleId: DataTypes.STRING,
      levelId: DataTypes.INTEGER,
      amount: DataTypes.DECIMAL,
      currency: DataTypes.STRING
    },
    {
      tableName: 'growth_reward'
    }
  )

  return GrowthReward
}
