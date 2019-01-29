'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthInvite = sequelize.define('GrowthInvite', {
    referrerEthAddress: DataTypes.STRING,
    refereeContactType: DataTypes.ENUM,
    refereeContact: DataTypes.STRING,
    status: DataTypes.ENUM
  }, {})

  return GrowthInvite
}