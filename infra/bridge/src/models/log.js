'use strict'

module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define(
    'Log',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      data: DataTypes.JSONB,
      ip: DataTypes.INET,
      headers: DataTypes.JSONB
    },
    {
      tableName: 'log',
      timestamps: true
    }
  )

  return Log
}
