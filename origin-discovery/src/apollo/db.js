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
    // TODO: expose blockNumber and logIndex in GraphQL schema
    blockNumber: row.blockNumber,
    logIndex: row.logIndex,
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
 *  Any listingId returned by the query and not included in orderByIds gets filtered out.
 * @return {Promise<Array<Listing>>}
 * @private
 */
async function _getListings (whereClause, orderByIds = []) {
  // Load rows from the Listing table in the DB.
  // Note: sequelize does not support DISTINCT ON. We work around it
  // by using a literal clause "DISTINCT ON(id) 1". The static column name 1 is there as
  // a workaround for sequelize adding a comma right after the literal expression which
  // otherwise causes the query to fail.
  // The query generated is equivalent to:
  //  SELECT DISTINCT ON (id) * FROM listing WHERE <where_clause> ORDER BY id DESC, block_number DESC, log_index DESC;
  const rows = await db.Listing.findAll({
    where: whereClause,
    attributes: [
      Sequelize.literal('DISTINCT ON(id) 1')
    ].concat(Object.keys(db.Listing.rawAttributes)),
    order: [ ['id', 'DESC'], ['blockNumber', 'DESC'], ['logIndex', 'DESC'] ]
  })
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
 * Queries DB to get listings based on their ids.
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
 * @param {Object} blockInfo - Optional max blockNumber and logIndex values (inclusive).
 *   This can be used to get the state of a listing at a given point in history.
 * @return {Promise<Object|null>}
 */
async function getListing (listingId, blockInfo = null) {
  let row
  if (blockInfo) {
    row = await db.Listing.findOne({
      where: { id: listingId, blockNumber: { [Sequelize.Op.lte]: blockInfo.blockNumber } },
      order: [['blockNumber', 'DESC'], ['logIndex', 'DESC']]
    })
    // Handle the rare case where a row satisfies the blockInfo.blockNumber condition
    // but not the logIndex one.
    if (row && blockInfo.logIndex &&
      row.blockNumber === blockInfo.blockNumber &&
      row.logIndex > blockInfo.logIndex) {
      row = null
    }
  } else {
    // Return most recent row for the listing.
    row = await db.Listing.findOne({
      where: { id: listingId },
      order: [ ['id', 'DESC'], ['blockNumber', 'DESC'], ['logIndex', 'DESC'] ],
      limit: 1
    })
  }
  if (!row) {
    return null
  }
  const listing = _makeListing(row)
  return listing
}

module.exports = { getListing, getListingsById, getListingsBySeller }
