'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthReferral = sequelize.define(
    'GrowthReferral',
    {
      referrerEthAddress: { type: DataTypes.STRING, primaryKey: true },
      refereeEthAddress: { type: DataTypes.STRING, primaryKey: true }
    },
    {
      tableName: 'growth_referral'
    }
  )

  return GrowthReferral
}
