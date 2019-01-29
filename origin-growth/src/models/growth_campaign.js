'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthCampaign = sequelize.define('GrowthCampaign', {
    id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    rules: DataTypes.JSONB,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    distributionDate: DataTypes.DATE,
    cap: DataTypes.DECIMAL,
    capUsed: DataTypes.DECIMAL,
    currency: DataTypes.STRING
  }, {})

  return GrowthCampaign
}