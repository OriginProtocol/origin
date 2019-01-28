'use strict'

module.exports = (sequelize, DataTypes) => {
  const growth_participant = sequelize.define('growth_participant', {
    ethAddress: DataTypes.STRING,
    data: DataTypes.JSONB,
    agreementId: DataTypes.STRING
  }, {})

  return growth_participant
}