'use strict'
module.exports = (sequelize, DataTypes) => {
  const Registry = sequelize.define(
    'Registry',
    {
      ethAddress: { type: DataTypes.STRING(64), primaryKey: true },
      data: DataTypes.JSON,
      signature: DataTypes.STRING(256)
    },
    {
      tableName: 'registry'
    }
  )
  Registry.associate = function() {
    // associations can be defined here
  }
  return Registry
}
