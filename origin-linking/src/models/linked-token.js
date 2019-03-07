'use strict'

module.exports = (sequelize, DataTypes) => {
  const LinkedToken = sequelize.define(
    'LinkedToken',
    {
      clientToken: DataTypes.STRING(255),
      walletToken: DataTypes.STRING(255),
      code: DataTypes.STRING(255),
      codeExpires: DataTypes.DATE,
      currentDeviceContext: DataTypes.JSON,
      pendingCallContext: DataTypes.JSON,
      clientPubKey: DataTypes.STRING(128),
      linked: DataTypes.BOOLEAN,
      appInfo: DataTypes.JSON,
      linkedAt: DataTypes.DATE
    },
    {
      tableName: 'linked_token'
    }
  )
  LinkedToken.associate = function(models) {
    // associations can be defined here
  }
  return LinkedToken
}
