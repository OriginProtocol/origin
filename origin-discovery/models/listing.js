'use strict'

module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
    id: { type: DataTypes.STRING(32), primaryKey: true },
    // Seller's eth wallet address.
    sellerAddress: DataTypes.CHAR(42),
    status: DataTypes.STRING(32),
    // JSON data as returned by the marketplace.getListing(listingId) method.
    data: DataTypes.JSONB,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    tableName: 'listing',
    // Do not automatically add the timestamp attributes (updatedAt, createdAt).
    timestamps: false
  })

  Listing.associate = function(models) {
    // associations can be defined here
  }

  return Listing
}