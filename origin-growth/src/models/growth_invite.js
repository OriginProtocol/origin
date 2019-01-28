'use strict'

module.exports = (sequelize, DataTypes) => {
  const growth_invite = sequelize.define('growth_invite', {
    referrerEthAddress: DataTypes.STRING,
    refereeContactType: DataTypes.ENUM,
    refereeContact: DataTypes.STRING,
    status: DataTypes.ENUM
  }, {})

  return growth_invite
}