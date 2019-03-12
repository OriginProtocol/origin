'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthReferral = sequelize.define(
    'GrowthReferral',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      referrerEthAddress: { type: DataTypes.STRING, primaryKey: true },
      refereeEthAddress: { type: DataTypes.STRING, unique: true }
    },
    {
      tableName: 'growth_referral'
    }
  )

  return GrowthReferral
}
