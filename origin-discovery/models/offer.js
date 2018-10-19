'use strict'

module.exports = (sequelize, DataTypes) => {
  const Offer = sequelize.define('Offer', {
    listingId: {
      type: DataTypes.STRING(32),
      primaryKey: true
    },
    offerId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    status: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    // Seller's wallet address.
    sellerAddress: {
      type: DataTypes.CHAR(42),
      allowNull: false
    },
    // Buyer's wallet address.
    buyerAddress: {
      type: DataTypes.CHAR(42),
      allowNull: false
    },
    ipfsHash: {
      type: DataTypes.CHAR(68),
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    tableName:'offer'
  })

  Offer.removeAttribute('id');

  Offer.associate = function(models) {
    // associations can be defined here
  }

  return Offer
}


