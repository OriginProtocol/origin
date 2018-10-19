'use strict'

module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
    id: {
      type: DataTypes.STRING(32),
      primaryKey: true
    },
    sellerAddress: {
      type: DataTypes.CHAR(42),
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    ipfsHash: {
      type: DataTypes.CHAR(68),
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    // Block number at which the listing was initially created.
    blockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Unix timestamp for the block at which the listing was initially created.
    blockTimestamp: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName:'listing'
  })

  Listing.associate = function(models) {
    // associations can be defined here
  }

  return Listing
}