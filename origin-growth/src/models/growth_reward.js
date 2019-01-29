'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthReward = sequelize.define('GrowthReward', {
    id: DataTypes.INTEGER,
    status: DataTypes.ENUM,
    ethAddress: DataTypes.STRING,
    campaignId: DataTypes.INTEGER,
    campaignLevel: DataTypes.INTEGER,
    campaignRule: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    currency: DataTypes.STRING
  }, {})

  return GrowthReward
}