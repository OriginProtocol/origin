'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthEvent = sequelize.define('GrowthEvent', {
    type: DataTypes.ENUM(enums.GrowthEventTypes),
    status: DataTypes.ENUM(enums.GrowthEventStatuses),
    ethAddress: DataTypes.STRING,
    data: DataTypes.JSONB
  }, {
    tableName: 'growth_event'
  })

  return GrowthEvent
}