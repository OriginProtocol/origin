'use strict';
module.exports = (sequelize, DataTypes) => {
  const growth_participant = sequelize.define('growth_participant', {
    ethAddress: DataTypes.STRING,
    data: DataTypes.JSONB,
    agreementId: DataTypes.STRING
  }, {});
  growth_participant.associate = function(models) {
    // associations can be defined here
  };
  return growth_participant;
};