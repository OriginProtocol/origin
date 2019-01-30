'use strict'

const { GrowthInviteContactTypes, GrowthInviteStatuses } = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthInvite = sequelize.define('GrowthInvite', {
    referrerEthAddress: DataTypes.STRING,
    refereeContactType: DataTypes.ENUM(GrowthInviteContactTypes),
    refereeContact: DataTypes.STRING,
    status: DataTypes.ENUM(GrowthInviteStatuses)
  }, {})

  return GrowthInvite
}