'use strict';
const {EthNotificationTypes} = require('origin/common/enums');

module.exports = (sequelize, DataTypes) => {
  const LinkedToken = sequelize.define('LinkedToken', {
    clientToken: DataTypes.STRING(255),
    deviceToken: DataTypes.STRING(255),
    deviceType: DataTypes.ENUM(EthNotificationTypes),
    code: DataTypes.STRING(255),
    codeExpires: DataTypes.DATE,
    currentDeviceContext: DataTypes.JSON,
    pendingCallContext: DataTypes.JSON,
    linked: DataTypes.BOOLEAN,
    appInfo: DataTypes.JSON,
    linkedAt: DataTypes.DATE
  }, {
    tableName:'linked_token'
  });
  LinkedToken.associate = function(models) {
    // associations can be defined here
  };
  return LinkedToken;
};
