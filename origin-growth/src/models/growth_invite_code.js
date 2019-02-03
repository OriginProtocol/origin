'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthInviteCode = sequelize.define('GrowthInviteCode', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    eth_address: DataTypes.STRING,
    code: DataTypes.STRING
  }, {
    tableName: 'growth_invite_code'
  })

  return GrowthInviteCode
}