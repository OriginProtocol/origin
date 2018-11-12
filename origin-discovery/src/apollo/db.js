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
    display: listingMetadata.getDisplay(row.id)
  }
}

/**
 * Helper method. Queries DB to get listings.
 * @param {Object} whereClause - Where clause to use for the DB query.
 * @param {Array<string>>} orderByIds - Defines the exact order of listings returned.
 *  Useful for preserving ranking of search results.
 *  Any listingId returned by the query and not included in orderByIds gets filtered.
 * @return {Promise<Array<Listing>>}
 * @private
 */
async function _getListings (whereClause, orderByIds = []) {
  // Load rows from the Listing table in the DB.
  const rows = await db.Listing.findAll({ where: whereClause })
  if (rows.length === 0) {
    return []
  }

  let listings
  if (orderByIds.length === 0) {
    listings = rows.map(row => _makeListing(row))
  } else {
    // Return results in oder specified by orderIds.
    const rowDict = {}
    rows.forEach(row => { rowDict[row.id] = row })
    listings = orderByIds.map(id => _makeListing(rowDict[id]))
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
  return _getListings(whereClause, listingIds)
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

/**
 * Helper function. Returns an offer object compatible with the GraphQL Offer schema.
 * @param {Object} row - Row read from DB offer table.
 * @return {Object}
 * @private
 */
function _makeOffer (row) {
  return {
    id: row.id,
    ipfsHash: row.data.ipfs.hash,
    data: row.data,
    status: row.status,
    price: row.data.price
  }
}

/**
 * Helper method. Queries DB to get offers.
 * @param {Object} whereClause - Where clause to use for the DB query.
 * @return {Promise<Array<Offer>>}
 * @private
 */
async function _getOffers (whereClause) {
  // Load rows from the Listing table in the DB.
  const rows = await db.Offer.findAll({ where: whereClause })
  if (rows.length === 0) {
    return []
  }

  return rows.map(row => _makeOffer(row))
}

/**
 * Queries DB to get offers.
 * @param {string} listingId - optional listing id
 * @param {string} buyerAddress - optional buyer address
 * @param {string} sellerAddress - optional seller address
 *
 * @return {Promise<Array<Offer>>}
 */
async function searchOffers (listingId, buyerAddress, sellerAddress) {
  let whereClause = {}

  if (listingId) {
    whereClause.listingId = listingId
  }
  if (buyerAddress) {
    whereClause.buyerAddress = buyerAddress
  }
  if (sellerAddress) {
    whereClause.sellerAddress = sellerAddress
  }
  if (Object.keys(whereClause).length === 0) {
    throw new Error('A filter must be specified: listingId, buyerAddress or sellerAddress')
  }
  const rows = await db.Offer.findAll({ where: clause })
  
  return rows.map(row => _makeOffer(row))
}


/**
 * Queries DB for an Offer.
 * @param offerId
 * @return {Promise<Object|null>}
 */
async function getOffer (offerId) {
  const row = await db.Offer.findByPk(offerId)
  if (!row) {
    return null
  }
  return _makeOffer(row)
}

module.exports = {
  getListing,
  getListingsById,
  getListingsBySeller,
  getOffer,
  searchOffers
}
