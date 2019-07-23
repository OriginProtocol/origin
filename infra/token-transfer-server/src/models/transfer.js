'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define(
    'Transfer',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: DataTypes.INTEGER,
      grantId: DataTypes.INTEGER,
      status: DataTypes.ENUM(enums.TransferStatuses),
      fromAddress: DataTypes.STRING,
      toAddress: DataTypes.STRING,
      amount: DataTypes.BIGINT, // Amount in token unit.
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