'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthInviteCode = sequelize.define(
    'GrowthInviteCode',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      ethAddress: DataTypes.STRING,
      code: DataTypes.STRING
    },
    {
      tableName: 'growth_invite_code'
    }
  )

  return GrowthInviteCode
}
