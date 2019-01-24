'use strict';
module.exports = (sequelize, DataTypes) => {
  const growth_participant = sequelize.define('growth_participant', {
    eth_address: DataTypes.STRING,
    data: DataTypes.JSONB,
    agreement_id: DataTypes.STRING
  }, {});
  growth_participant.associate = function(models) {
    // associations can be defined here
  };
  return growth_participant;
};