'use strict'

module.exports = (sequelize, DataTypes) => {
  const growth_reward = sequelize.define('growth_reward', {
    id: DataTypes.INTEGER,
    status: DataTypes.ENUM,
    ethAddress: DataTypes.STRING,
    campaignId: DataTypes.INTEGER,
    campaignLevel: DataTypes.INTEGER,
    campaignRule: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    currency: DataTypes.STRING
  }, {})

  return growth_reward
}