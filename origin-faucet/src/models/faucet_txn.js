'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const FaucetTxn = sequelize.define(
    'FaucetTxn',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      status: DataTypes.ENUM(enums.FaucetTxnStatuses),
      campaignId: DataTypes.INTEGER,
      inviteCode: DataTypes.STRING,
      fromAddress: DataTypes.STRING,
      toAddress: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      currency: DataTypes.STRING,
      txnHash: DataTypes.STRING
    },
    {
      tableName: 'faucet_campaign'
    }
  )

  return FaucetTxn
}
