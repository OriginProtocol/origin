'use strict';
module.exports = (sequelize, DataTypes) => {
  const growth_invite = sequelize.define('growth_invite', {
    referrer_eth_address: DataTypes.STRING,
    type: DataTypes.ENUM,
    referrer_contact: DataTypes.STRING,
    status: DataTypes.ENUM
  }, {});
  growth_invite.associate = function(models) {
    // associations can be defined here
  };
  return growth_invite;
};