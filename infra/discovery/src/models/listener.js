'use strict'

module.exports = (sequelize, DataTypes) => {
  const Listener = sequelize.define(
    'Listener',
    {
      // Listener unique id.
      id: { type: DataTypes.STRING, primaryKey: true },
      // The block number the listener should start at upon a restart.
      blockNumber: DataTypes.INTEGER,
      // Creation date.
      createdAt: DataTypes.DATE,
      // Date of most recent update, or null if no update.
      updatedAt: DataTypes.DATE
    },
    {
      tableName: 'listener'
    }
  )

  Listener.associate = function() {
    // associations can be defined here
  }

  return Listener
}
