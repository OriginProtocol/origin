'use strict'

module.exports = (sequelize, DataTypes) => {
  const growth_event = sequelize.define('growth_event', {
    id: DataTypes.INTEGER,
    type: DataTypes.ENUM,
    status: DataTypes.ENUM,
    eth_address: DataTypes.STRING,
    data: DataTypes.JSONB
  }, {})

  return growth_event
}