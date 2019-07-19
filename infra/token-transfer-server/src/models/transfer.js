'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define(
    'GrowthPayout',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      status: DataTypes.ENUM(enums.TransferStatuses),
      fromAddress: DataTypes.STRING,
      toAddress: DataTypes.STRING,
      amount: DataTypes.DECIMAL, // Amount in natural unit.
      currency: DataTypes.STRING, // 3 letters token name. Ex: OGN
      txHash: DataTypes.STRING,
      data: DataTypes.JSONB
    },
    {
      tableName: 't3_transfer'
    }
  )

  return Transfer
}