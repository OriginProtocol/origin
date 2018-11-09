const Sequelize = require('sequelize')

const db = require('../models')

/**
 * Helper function. Returns a listing object compatible with the GraphQL Listing schema.
 */
function _makeListing (row, display) {
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

/**
 * Returns listings from the DB based on a list of ids.
 * @param {Array<string>} listingIds - Listing ids.
 * @param {Array<string>} hiddenIds - Hidden listing ids.
 * @param {Array<string>} featuredIds - Featured listing ids.
 * @return {Promise<Array>}
 *
 */
async function getListings (listingIds, hiddenIds = [], featuredIds = []) {
  // Load rows from the Listing table in the DB.
  const rows = await db.Listing.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: listingIds
      }
    }
  })
  if (rows.length === 0) {
    return []
  }

  // Create a map id -> listing row for ease of lookup.
  const rowDict = {}
  rows.forEach(row => {
    rowDict[row.id] = row
  })

  // Create listing objects to return.
  // Note: preserve ranking by keeping returned listings in same order as listingIds.
  const listings = []
  listingIds.forEach(id => {
    let display = 'normal'
    if (hiddenIds.includes(id)) {
      display = 'hidden'
    } else if (featuredIds.includes(id)) {
      display = 'featured'
    }

    const row = rowDict[id]
    const listing = _makeListing(row, display)
    listings.push(listing)
  })
  return listings
}

module.exports = { getListings }
