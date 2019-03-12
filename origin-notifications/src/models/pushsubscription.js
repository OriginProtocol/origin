'use strict'

module.exports = (sequelize, DataTypes) => {
  const PushSubscription = sequelize.define(
    'PushSubscription',
    {
      endpoint: DataTypes.STRING,
      keys: DataTypes.HSTORE,
      // Not used. Placeholder for future use.
      expirationTime: DataTypes.DATE,
      // ETH address, lowercase.
      account: DataTypes.STRING,
      // Creation date.
      createdAt: DataTypes.DATE,
      // Date of most recent update.
      updatedAt: DataTypes.DATE
    },
    {
      tableName: 'push_subscription'
    }
  )

  PushSubscription.associate = function() {
    // associations can be defined here
  }

  return PushSubscription
}
