'use strict'

module.exports = (sequelize, DataTypes) => {
  const GrowthEvent = sequelize.define('GrowthEvent', {
    id: DataTypes.INTEGER,
    type: DataTypes.ENUM,
    status: DataTypes.ENUM,
    eth_address: DataTypes.STRING,
    data: DataTypes.JSONB
  }, {})

  return GrowthEvent
}