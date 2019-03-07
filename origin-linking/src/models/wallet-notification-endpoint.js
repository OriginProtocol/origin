'use strict'
const { EthNotificationTypes } = require('origin/common/enums')

module.exports = (sequelize, DataTypes) => {
  const WalletNotificationEndpoint = sequelize.define(
    'WalletNotificationEndpoint',
    {
      ethAddress: DataTypes.STRING(255),
      walletToken: DataTypes.STRING(255),
      deviceToken: DataTypes.STRING(255),
      deviceType: DataTypes.ENUM(EthNotificationTypes)
    },
    {
      tableName: 'wallet_notification_endpoint'
    }
  )
  WalletNotificationEndpoint.associate = function(models) {
    // associations can be defined here
  }
  return WalletNotificationEndpoint
}
