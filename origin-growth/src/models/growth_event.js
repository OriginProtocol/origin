'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthEvent = sequelize.define('GrowthEvent', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    type: DataTypes.ENUM(enums.GrowthEventTypes),
    status: DataTypes.ENUM(enums.GrowthEventStatuses),
    eth_address: DataTypes.STRING,
    data: DataTypes.JSONB
  }, {
    tableName: 'growth_event'
  })

  return GrowthEvent
}