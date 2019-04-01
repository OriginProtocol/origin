'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const FaucetTxn = sequelize.define(
    'FaucetTxn',
    {
      campaignId: DataTypes.INTEGER,
      status: DataTypes.ENUM(enums.FaucetTxnStatuses),
      fromAddress: DataTypes.STRING,
      toAddress: DataTypes.STRING,
      amount: DataTypes.DECIMAL, // Amount in natural units (Wei for ETH).
      currency: DataTypes.STRING,
      txnHash: DataTypes.STRING
    },
    {
      tableName: 'faucet_txn'
    }
  )

  return FaucetTxn
}
