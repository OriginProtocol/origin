const Sequelize = require('sequelize')

const db = require('../models')
const listingMetadata = require('./listing-metadata')

/**
 * Helper function. Returns a listing object compatible with the GraphQL Listing schema.
 * @param {Object} row - Row read from DB listing table.
 * @return {Object}
 * @private
 */
function _makeListing (row) {
  // Compute display.
  let display = 'normal'
  if (listingMetadata.hiddenIds.includes(row.id)) {
    display = 'hidden'
  } else if (listingMetadata.featuredIds.includes(row.id)) {
    display = 'featured'
  }
  // Create listing object compatible with the GraphQL schema.
  return {
    id: row.id,
    ipfsHash: row.data.ipfs.hash,
    data: row.data,
    title: row.data.title,
    description: row.data.description,
    category: row.data.category,
    subCategory: row.data.subCategory,
    // TODO: price may not be defined at the listing level for all listing types.
    // For example, for fractional usage it may vary based on time slot.
    price: row.data.price,
    display
  }
}

async function _getListings (whereClause, orderIds = []) {
  // Load rows from the Listing table in the DB.
  const rows = await db.Listing.findAll({ where: whereClause })
  if (rows.length === 0) {
    return []
  }

  let listings
  if (orderIds.length === 0) {
    listings = rows.map(row => _makeListing(row))
  } else {
    // Return results in oder specified by orderIds.
    // Useful for preserving ranking of search results.
    const rowDict = {}
    rows.forEach(row => { rowDict[row.id] = row })
    listings = orderIds.map(id => _makeListing(rows[id]))
  }

  return listings
}

/**
 * Queries DB to get listings based their ids.
 * @param {Array<string>} listingIds - Listing ids.
 * @return {Promise<Array|null>}
 */
async function getListingsById (listingIds) {
  const whereClause = { id: { [Sequelize.Op.in]: listingIds } }
  return _getListings(whereClause)
}

/**
 * Queries DB to get listings created by a user.
 * @param {Array<string>} listingIds - Listing ids.
 * @return {Promise<Array|null>}
 */
async function getListingsBySeller (sellerAddress) {
  const whereClause = { sellerAddress: sellerAddress.toLowerCase() }
  return _getListings(whereClause)
}

/**
 * Queries DB for a listing.
 * @param listingId
 * @return {Promise<Object|null>}
 */
async function getListing (listingId) {
  const row = await db.Listing.findByPk(listingId)
  if (!row) {
    return null
  }
  const listing = _makeListing(row)
  return listing
}

module.exports = { getListing, getListingsById, getListingsBySeller }
