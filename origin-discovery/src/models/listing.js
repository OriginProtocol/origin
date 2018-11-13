'use strict'

module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
    id: { type: DataTypes.STRING(32), primaryKey: true },
    // Seller's eth wallet address, lowercase.
    sellerAddress: DataTypes.CHAR(42),
    // Offer status as returned by the marketplace.getListing(listingId) method.
    status: DataTypes.STRING(32),
    // JSON data as returned by the marketplace.getListing(listingId) method.
    data: DataTypes.JSONB,
    // Creation date.
    createdAt: DataTypes.DATE,
    // Date of most recent update, or null if no update.
    updatedAt: DataTypes.DATE
  }, {
    tableName: 'listing',
    // Do not automatically add the timestamp attributes (updatedAt, createdAt).
    timestamps: false
  })

  Listing.associate = function () {
    // associations can be defined here
  }

  return Listing
}
