'use strict'

module.exports = (sequelize, DataTypes) => {
  const PushSubscription = sequelize.define('PushSubscription', {
    endpoint: DataTypes.STRING,
    keys: DataTypes.HSTORE,
    expirationTime: DataTypes.DATE,
    account: DataTypes.STRING
  }, {})

  return PushSubscription
}
