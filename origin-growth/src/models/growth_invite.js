'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthInvite = sequelize.define(
    'GrowthInvite',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      referrerEthAddress: DataTypes.STRING,
      refereeContactType: DataTypes.ENUM(enums.GrowthInviteContactTypes),
      refereeContact: DataTypes.STRING,
      status: DataTypes.ENUM(enums.GrowthInviteStatuses)
    },
    {
      tableName: 'growth_invite'
    }
  )

  return GrowthInvite
}
