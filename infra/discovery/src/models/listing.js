'use strict'

module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define(
    'Listing',
    {
      // Listing id.
      id: { type: DataTypes.STRING(64), primaryKey: true },
      // Block number at which the listing event was recorded.
      blockNumber: { type: DataTypes.INTEGER, primaryKey: true },
      // Index of the listing event within the block.
      logIndex: { type: DataTypes.INTEGER, primaryKey: true },
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
    },
    {
      tableName: 'listing'
    }
  )

  Listing.associate = function() {
    // associations can be defined here
  }

  return Listing
}
