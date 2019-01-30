'use strict'

const { GrowthEventTypes, GrowthEventStatuses } = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthEvent = sequelize.define('GrowthEvent', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    type: DataTypes.ENUM(GrowthEventTypes),
    status: DataTypes.ENUM(GrowthEventStatuses),
    eth_address: DataTypes.STRING,
    data: DataTypes.JSONB
  }, {})

  return GrowthEvent
}