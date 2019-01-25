'use strict';
module.exports = (sequelize, DataTypes) => {
  const growth_referral = sequelize.define('growth_referral', {
    referrerEthAddress: DataTypes.STRING,
    refereeEthAddress: DataTypes.STRING
  }, {});
  growth_referral.associate = function(models) {
    // associations can be defined here
  };
  return growth_referral;
};