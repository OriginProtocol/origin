'use strict';
module.exports = (sequelize, DataTypes) => {
  const DiscoveryAccessToken = sequelize.define('DiscoveryAccessToken', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    authToken: DataTypes.STRING,
    ethAddress: DataTypes.STRING,
    nonce: DataTypes.STRING,
    expires: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'discovery_access_token'
  });
  DiscoveryAccessToken.associate = function(models) {
    // associations can be defined here
  };
  return DiscoveryAccessToken;
};