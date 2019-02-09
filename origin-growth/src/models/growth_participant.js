'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthParticipant = sequelize.define(
    'GrowthParticipant',
    {
      ethAddress: { type: DataTypes.STRING, primaryKey: true },
      data: DataTypes.JSONB,
      agreementId: DataTypes.STRING
    },
    {
      tableName: 'growth_participant'
    }
  )

  return GrowthParticipant
}
