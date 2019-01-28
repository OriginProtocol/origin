'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthInviteCode = sequelize.define('GrowthInviteCode', {
    eth_address: DataTypes.STRING,
    code: DataTypes.STRING
  }, {})

  return GrowthInviteCode
}