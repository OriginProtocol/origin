'use strict'

module.exports = (sequelize, DataTypes) => {
  // Note: all addresses and hashes are stored in lowercase hexadecimal notation.
  const Event = sequelize.define(
    'Event',
    {
      // Block number at which the event was recorded.
      blockNumber: { type: DataTypes.INTEGER, primaryKey: true },
      // Index of the event within the block.
      logIndex: { type: DataTypes.INTEGER, primaryKey: true },
      // Address of the contract that emitted the event.
      contractAddress: DataTypes.CHAR(42),
      // Hash of the transaction that triggered firing the event,
      transactionHash: DataTypes.CHAR(66),
      // First topic is the signature of the event.
      topic0: DataTypes.CHAR(66),
      // Next 3 topics are the optional indexed event arguments.
      topic1: DataTypes.CHAR(66),
      topic2: DataTypes.CHAR(66),
      topic3: DataTypes.CHAR(66),
      // JSON data for the event as returned by web3 method getPastEvents.
      data: DataTypes.JSONB,
      // Creation date.
      createdAt: DataTypes.DATE
    },
    {
      tableName: 'event',
      // Do not automatically add the timestamp attributes (updatedAt, createdAt).
      timestamps: false
    }
  )

  Event.associate = function() {
    // associations can be defined here
  }

  return Event
}
