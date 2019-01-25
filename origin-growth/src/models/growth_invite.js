'use strict';
module.exports = (sequelize, DataTypes) => {
  const growth_invite = sequelize.define('growth_invite', {
    referrerEthAddress: DataTypes.STRING,
    refereeContactType: DataTypes.ENUM,
    refereeContact: DataTypes.STRING,
    status: DataTypes.ENUM
  }, {});
  growth_invite.associate = function(models) {
    // associations can be defined here
  };
  return growth_invite;
};