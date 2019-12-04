'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthInviteCode = sequelize.define(
    'GrowthInviteCode',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      ethAddress: DataTypes.STRING,
      code: { type: DataTypes.STRING, unique: true }
    },
    {
      tableName: 'growth_invite_code'
    }
  )

  return GrowthInviteCode
}
