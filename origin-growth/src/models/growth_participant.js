'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthParticipant = sequelize.define('GrowthParticipant', {
    ethAddress: DataTypes.STRING,
    data: DataTypes.JSONB,
    agreementId: DataTypes.STRING
  }, {})

  return GrowthParticipant
}