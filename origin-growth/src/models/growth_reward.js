'use strict';
module.exports = (sequelize, DataTypes) => {
  const growth_reward = sequelize.define('growth_reward', {
    id: DataTypes.INTEGER,
    status: DataTypes.ENUM,
    eth_address: DataTypes.STRING,
    campaign_id: DataTypes.INTEGER,
    campaign_level: DataTypes.INTEGER,
    campaign_rule: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    currency: DataTypes.STRING
  }, {});
  growth_reward.associate = function(models) {
    // associations can be defined here
  };
  return growth_reward;
};