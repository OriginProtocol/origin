const Sequelize = require('sequelize')

const db = require('../models')
const listingMetadata = require('../apollo/listing-metadata')

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
    display: listingMetadata.getDisplay(row.id),
    // TODO: expose blockNumber and logIndex in GraphQL schema
    blockNumber: row.blockNumber,
    logIndex: row.logIndex
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
 * Queries DB to get listings based on their ids.
 * @param {Array<string>} listingIds - Listing ids.
 * @return {Promise<Array|null>}
 */
async function getListingsById (listingIds) {
  const whereClause = { id: { [Sequelize.Op.in]: listingIds }, latest: true }
  return _getListings(whereClause, listingIds)
}

/**
 * Queries DB to get listings created by a user.
 * @param {Array<string>} listingIds - Listing ids.
 * @return {Promise<Array|null>}
 */
async function getListingsBySeller (sellerAddress) {
  const whereClause = { sellerAddress: sellerAddress.toLowerCase(), latest: true }
  return _getListings(whereClause)
}

/**
 * Queries DB for a listing.
 * @param listingId
 * @param {Object} blockInfo - Optional max blockNumber and logIndex values. This can be used
 *   to get the state of a listing at a given point in history.
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
    row = await db.Listing.findOne({ where: { id: listingId, latest: true } })
  }
  if (!row) {
    return null
  }
  const listing = _makeListing(row)
  return listing
}

/**
 * Inserts or updates listing data.
 * Ensures the listing row with most recent data has the "latest" column set to true.
 * TODO: Add locking to prevent risk of race condition that could cause latest column
 *       to be set on a row that is not the most recent if multiple event-listeners
 *       are running concurrently.
 * @param listingData
 * @return {Promise}
 */
async function upsertListing (listing) {
  // Determine if the row being updated/inserted is the latest for the listing.
  const latestRow = await db.Listing.findOne({
    where: { id: listing.id },
    order: [['blockNumber', 'DESC'], ['logIndex', 'DESC']]
  })
  const isLatest = !latestRow ||
    (listing.blockNumber > latestRow.blockNumber) ||
    (listing.blockNumber === latestRow.blockNumber && listing.logIndex >= latestRow.logIndex)
  listing.latest = isLatest

  return db.sequelize.transaction(async (t) => {
    if (isLatest) {
      // If row being updated/inserted is latest, unset the latest flag on other row.
      await db.Listing.update({ latest: false }, { where: { id: listing.id } }, { transaction: t })
    }
    await db.Listing.upsert(listing, { transaction: t })
  })
}

module.exports = { getListing, getListingsById, getListingsBySeller, upsertListing }
