'use strict';
const {EthNotificationTypes} = require('origin/common/enums');

module.exports = (sequelize, DataTypes) => {
  const EthNotificationEndpoint = sequelize.define('EthNotificationEndpoint', {
    ethAddress: DataTypes.STRING(255),
    deviceToken: DataTypes.STRING(255),
    type: DataTypes.ENUM(EthNotificationTypes),
    active: DataTypes.BOOLEAN,
    verified: DataTypes.BOOLEAN,
    expiresAt: DataTypes.DATE
  }, {
    tableName:'eth_notification_endpoint'
  });
  EthNotificationEndpoint.associate = function(models) {
    // associations can be defined here
  };
  return EthNotificationEndpoint;
};
