'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const GrowthParticipant = sequelize.define(
    'GrowthParticipant',
    {
      ethAddress: { type: DataTypes.STRING, primaryKey: true },
      status: DataTypes.ENUM(enums.GrowthParticipantStatuses),
      data: DataTypes.JSONB,
      agreementId: DataTypes.STRING,
      authToken: DataTypes.STRING
    },
    {
      tableName: 'growth_participant'
    }
  )

  return GrowthParticipant
}
