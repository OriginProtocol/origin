'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthReferral = sequelize.define('GrowthReferral', {
    referrerEthAddress: DataTypes.STRING,
    refereeEthAddress: DataTypes.STRING
  }, {})

  return GrowthReferral
}