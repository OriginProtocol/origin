'use strict'

module.exports = (sequelize, DataTypes) => {
  const Offer = sequelize.define(
    'Offer',
    {
      id: { type: DataTypes.STRING(64), primaryKey: true },
      listingId: DataTypes.STRING(32),
      // Offer status as returned by the marketplace.getOffer(offerId) method.
      status: DataTypes.STRING(32),
      // Seller's eth wallet address, lowercase.
      sellerAddress: DataTypes.CHAR(42),
      // Buyer's eth wallet address, lowercase.
      buyerAddress: DataTypes.CHAR(42),
      // JSON data as returned by the marketplace.getOffer(offerId) method.
      data: DataTypes.JSONB,
      // Creation date.
      createdAt: DataTypes.DATE,
      // Date of most recent update, or null if no update.
      updatedAt: DataTypes.DATE
    },
    {
      tableName: 'offer',
      // Do not automatically add the timestamp attributes (updatedAt, createdAt).
      timestamps: false
    }
  )

  Offer.associate = function() {
    // associations can be defined here
  }

  return Offer
}
