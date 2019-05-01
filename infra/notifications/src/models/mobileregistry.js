'use strict'

module.exports = (sequelize, DataTypes) => {
  const MobileRegistry = sequelize.define(
    'MobileRegistry',
    {
      ethAddress: { type: DataTypes.STRING(255), primaryKey: true },
      deviceToken: { type: DataTypes.STRING(255), primaryKey: true },
      deviceType: DataTypes.ENUM('APN', 'FCM'),
      permissions: DataTypes.JSONB,
      deleted: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {
      tableName: 'mobile_registry'
    }
  )
  MobileRegistry.associate = function() {
    // associations can be defined here
  }
  return MobileRegistry
}
