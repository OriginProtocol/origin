'use strict'
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    'Event',
    {
      // Block number at which the event was recorded.
      block_number: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      // Index of the event within the block.
      log_index: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      // Index of the transaction within the block.
      transaction_index: DataTypes.INTEGER,
      // Hash of the block that contains the event,
      block_hash: DataTypes.CHAR,
      // Hash of the transaction that triggered firing the event,
      transaction_hash: DataTypes.CHAR,
      // First topic is the signature of the event.
      topic0: DataTypes.CHAR,
      // Next 3 topics are the optional indexed event arguments.
      topic1: DataTypes.CHAR,
      topic2: DataTypes.CHAR,
      topic3: DataTypes.CHAR,
      // Address of the contract
      address: DataTypes.CHAR,
      // The name of the event
      event: DataTypes.STRING,
      // The event signature
      signature: DataTypes.STRING,
      // JSON data for the event as returned by web3 method getPastEvents.
      data: DataTypes.JSONB,
      // JSON data of decoded event arguments
      return_values: DataTypes.JSONB
    },
    {
      tableName: 'event'
    }
  )

  Event.associate = function() {}

  return Event
}
