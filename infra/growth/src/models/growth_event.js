'use strict'

const Sequelize = require('sequelize')

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthEvent = sequelize.define(
    'GrowthEvent',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customId: DataTypes.STRING,
      type: DataTypes.ENUM(enums.GrowthEventTypes),
      status: DataTypes.ENUM(enums.GrowthEventStatuses),
      ethAddress: DataTypes.STRING,
      data: DataTypes.JSONB,
      createdAt: DataTypes.DATE,
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    },
    {
      tableName: 'growth_event',
      // Do not automatically populate the timestamp attributes (updatedAt, createdAt).
      timestamps: false
    }
  )

  return GrowthEvent
}
