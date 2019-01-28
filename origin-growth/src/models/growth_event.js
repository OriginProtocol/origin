'use strict';
module.exports = (sequelize, DataTypes) => {
  const growth_event = sequelize.define('growth_event', {
    id: DataTypes.INTEGER,
    type: DataTypes.ENUM,
    status: DataTypes.ENUM,
    eth_address: DataTypes.STRING,
    data: DataTypes.JSONB
  }, {});
  growth_event.associate = function(models) {
    // associations can be defined here
  };
  return growth_event;
};