'use strict'

module.exports = (sequelize, DataTypes) => {
  const Offer = sequelize.define('Offer', {
    id: { type: DataTypes.STRING(64), primaryKey: true },
    listingId: DataTypes.STRING(32),
    // Offer status as defined by contracts.
    status: DataTypes.STRING(32),
    // Seller's eth wallet address.
    sellerAddress: DataTypes.CHAR(42),
    // Buyer's eth wallet address.
    buyerAddress: DataTypes.CHAR(42),
    // JSON data as returned by the marketplace.getOffer(offerId) method.
    data: DataTypes.JSONB,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    tableName: 'offer',
    // Do not automatically add the timestamp attributes (updatedAt, createdAt).
    timestamps: false
  })

  Offer.associate = function(models) {
    // associations can be defined here
  }

  return Offer
}


