'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const RelayerTxn = sequelize.define(
    'RelayerTxn',
    {
      status: DataTypes.ENUM(enums.RelayerTxnStatuses),
      from: DataTypes.STRING, // Issuer ETH address.
      to: DataTypes.STRING, // Contract address.
      method: DataTypes.STRING, // Contract method called.
      forwarder: DataTypes.STRING, // Address of the hot wallet used to forward the transaction.
      gas: DataTypes.INTEGER, // Units of gas used.
      gasPrice: DataTypes.INTEGER, // Gas price, in wei.
      txHash: DataTypes.STRING, // Blockchain transaction hash.
      data: DataTypes.JSONB // Stores various metadata.
    },
    {
      tableName: 'relayer_txn'
    }
  )

  return RelayerTxn
}
