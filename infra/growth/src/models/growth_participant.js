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
      authToken: DataTypes.STRING,
      ip: DataTypes.INET,
      country: DataTypes.CHAR(2),
      // Populated only if status is banned and if such contains reason(s) why participant was banned.
      ban: DataTypes.JSONB,
      // Participant is an Origin employee.
      employee: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {
      tableName: 'growth_participant'
    }
  )

  return GrowthParticipant
}
