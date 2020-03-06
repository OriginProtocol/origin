'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthAdminActivity = sequelize.define(
    'GrowthAdminActivity',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      ethAddress: DataTypes.STRING,
      action: DataTypes.ENUM(enums.GrowthAdminActivityActions),
      data: DataTypes.JSONB
    },
    {
      tableName: 'growth_admin_activity'
    }
  )

  return GrowthAdminActivity
}
