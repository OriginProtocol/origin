'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthCampaign = sequelize.define(
    'GrowthCampaign',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: DataTypes.STRING,
      rules: DataTypes.JSONB,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      distributionDate: DataTypes.DATE,
      cap: DataTypes.DECIMAL,
      capUsed: DataTypes.DECIMAL,
      currency: DataTypes.STRING
    },
    {
      tableName: 'growth_campaign'
    }
  )

  return GrowthCampaign
}
