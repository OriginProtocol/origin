'use strict'

module.exports = (sequelize, DataTypes) => {
  const growth_campaign = sequelize.define('growth_campaign', {
    id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    rules: DataTypes.JSONB,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    distributionDate: DataTypes.DATE,
    cap: DataTypes.DECIMAL,
    capUsed: DataTypes.DECIMAL
  }, {})

  return growth_campaign
}