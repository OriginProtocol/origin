'use strict';
module.exports = (sequelize, DataTypes) => {
  const growth_campaign = sequelize.define('growth_campaign', {
    id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    rules: DataTypes.JSONB,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    distribution_date: DataTypes.DATE,
    cap: DataTypes.INTEGER,
    user_cap: DataTypes.INTEGER
  }, {});
  growth_campaign.associate = function(models) {
    // associations can be defined here
  };
  return growth_campaign;
};