'use strict'

module.exports = (sequelize, DataTypes) => {
  const growth_referral = sequelize.define('growth_referral', {
    referrerEthAddress: DataTypes.STRING,
    refereeEthAddress: DataTypes.STRING
  }, {})

  return growth_referral
}