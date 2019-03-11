const Sequelize = require('sequelize')

const db = require('../models')
const listingMetadata = require('./listing-metadata')

/**
 * Helper function. Returns a listing object compatible with the GraphQL Listing schema.
 * @param {Object} row - Row read from DB listing table.
 * @return {Object}
 * @private
 */
function _makeListing(row) {
  return {
    id: row.id,
    blockInfo: {
      blockNumber: row.blockNumber,
      logIndex: row.logIndex
    },
    ipfsHash: row.data.ipfs.hash,
    data: row.data,
    title: row.data.title,
    description: row.data.description,
    category: row.data.category,
    subCategory: row.data.subCategory,
    // TODO: price may not be defined at the listing level for all listing types.
    // For example, for fractional usage it may vary based on time slot.
    price: row.data.price,
    commission: row.data.commission,
    commissionPerUnit: row.data.commissionPerUnit,
    display: listingMetadata.getDisplay(row.id),
    marketplacePublisher: row.data.marketplacePublisher,
    updatedAt: row.updatedAt,
    updateVersion: row.data.updateVersion,
    createDate: row.data.createDate
  }
}

/**
 * Helper method. Queries DB to get listings.
 *
 * The query generated is equivalent to:
 *  SELECT DISTINCT ON (id) * FROM listing WHERE <where_clause>
 *  ORDER BY id DESC, block_number DESC, log_index DESC;
 *
 * Note: sequelize does not support DISTINCT ON. We work around it
 * by using a literal clause "DISTINCT ON(id) 1". The static column name 1 is there as
 * a workaround for sequelize adding a comma right after the literal expression which
 * otherwise causes the query to fail.
 *
 * @param {Object} whereClause - Where clause to use for the DB query.
 * @param {Array<string>>} orderByIds - Defines the exact order of listings returned.
 *  Useful for preserving ranking of search results.
 *  Any listingId returned by the query and not included in orderByIds gets filtered out.
 * @return {Promise<Array<Listing>>}
 * @private
 */
async function _getListings(whereClause, orderByIds = []) {
  const rows = await db.Listing.findAll({
    where: whereClause,
    attributes: [Sequelize.literal('DISTINCT ON(id) 1')].concat(
      Object.keys(db.Listing.rawAttributes)
    ),
    order: [['id', 'DESC'], ['blockNumber', 'DESC'], ['logIndex', 'DESC']]
  })
  if (rows.length === 0) {
    return []
  }

  let listings = []
  if (orderByIds.length === 0) {
    listings = rows.map(row => _makeListing(row))
  } else {
    // Return results in oder specified by orderIds.
    const rowDict = {}
    rows.forEach(row => {
      rowDict[row.id] = row
    })
    orderByIds.forEach(id => {
      if (!rowDict[id]) {
        console.log(
          `ERROR: Data inconsistency - Listing id ${id} in ES but not in DB.`
        )
        return
      }
      listings.push(_makeListing(rowDict[id]))
    })
  }

  return listings
}

/**
 * Queries DB to get listings based on their ids.
 * @param {Array<string>} listingIds - Listing ids.
 * @return {Promise<Array|null>}
 */
async function getListingsById(listingIds) {
  const whereClause = { id: { [Sequelize.Op.in]: listingIds } }
  return _getListings(whereClause, listingIds)
}

/**
 * Queries DB to get listings created by a user.
 * @param {Array<string>} listingIds - Listing ids.
 * @return {Promise<Array|null>}
 */
async function getListingsBySeller(sellerAddress) {
  const whereClause = { sellerAddress: sellerAddress.toLowerCase() }
  return _getListings(whereClause)
}

/**
 * Queries DB for a listing.
 *
 * @param listingId
 * @param {{blockNumber: integer, logIndex: integer}} blockInfo - Optional max
 *   blockNumber and logIndex values (inclusive). This can be used to get the
 *   state of a listing at a given point in history. Here is an example:
 *     blockNum=1, logIndex=34 -> Listing Created by seller
 *     blockNum=2, logIndex=12 -> Offer Created by buyer
 *     blockNum=2, logIndex=56 -> Listing Updated by seller
 *   When we load the listing to show to the buyer who made the offer, we make a call to
 *   marketplace.getListing(blockNum=2, logIndex=12) and it should load the listing
 *   version (blockNum=1, logIndex=34).
 * @return {Promise<Object|null>}
 */
async function getListing(listingId, blockInfo = null) {
  let row
  if (blockInfo) {
    // Build a query that looks like:
    // SELECT * FROM listing WHERE id=listingId AND
    //      (block_number < blockInfo.blockNumber OR
    //      (block_number = blockInfo.blockNumber AND log_index <= blockInfo.logIndex))
    // ORDER BY block_number DESC, log_index DESC
    // LIMIT 1
    row = await db.Listing.findOne({
      where: {
        id: listingId,
        [Sequelize.Op.or]: [
          {
            blockNumber: { [Sequelize.Op.lt]: blockInfo.blockNumber }
          },
          {
            blockNumber: blockInfo.blockNumber,
            logIndex: { [Sequelize.Op.lte]: blockInfo.logIndex }
          }
        ]
      },
      order: [['blockNumber', 'DESC'], ['logIndex', 'DESC']]
    })
  } else {
    // Return most recent row for the listing.
    row = await db.Listing.findOne({
      where: { id: listingId },
      order: [['id', 'DESC'], ['blockNumber', 'DESC'], ['logIndex', 'DESC']],
      limit: 1
    })
  }
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
function _makeOffer(row) {
  if (
    row.data.events.length === 0 ||
    row.data.events[0].event !== 'OfferCreated'
  ) {
    throw new Error('Can not find OfferCreated event')
  }
  return {
    id: row.id,
    blockInfo: {
      blockNumber: row.data.events[0].blockNumber,
      logIndex: row.data.events[0].logIndex
    },
    ipfsHash: row.data.ipfs.hash,
    data: row.data,
    status: row.status,
    buyerAddress: row.buyerAddress,
    sellerAddress: row.sellerAddress,
    totalPrice: row.data.totalPrice,
    unitsPurchased: row.data.unitsPurchased,
    // See https://github.com/OriginProtocol/origin/issues/1087
    // as to why we extract commission from the ipfs data.
    commission: row.data.ipfs.data.commission
  }
}

/**
 * Queries DB to get offers.
 * @param {string} listingId - optional listing id
 * @param {string} buyerAddress - optional buyer address
 * @param {string} sellerAddress - optional seller address
 * @return {Promise<Array<Object>>}
 */
async function getOffers({
  listingId = null,
  buyerAddress = null,
  sellerAddress = null
}) {
  const whereClause = {}

  if (listingId) {
    whereClause.listingId = listingId
  }
  if (buyerAddress) {
    whereClause.buyerAddress = buyerAddress.toLowerCase()
  }
  if (sellerAddress) {
    whereClause.sellerAddress = sellerAddress.toLowerCase()
  }
  if (Object.keys(whereClause).length === 0) {
    throw new Error(
      'A filter must be specified: listingId, buyerAddress or sellerAddress'
    )
  }
  const rows = await db.Offer.findAll({ where: whereClause })

  return rows.map(row => _makeOffer(row))
}

/**
 * Queries DB for an Offer.
 * @param offerId
 * @return {Promise<Object|null>}
 */
async function getOffer(offerId) {
  const row = await db.Offer.findByPk(offerId)
  if (!row) {
    return null
  }
  return _makeOffer(row)
}

/**
 * Query DB for creating a Listing
 * @param listingData
 * @return {Promise<Object|null>}
 *
 */
async function createListing(listingData) {
  await db.Listing.upsert(listingData)
  return getListing(listingData.id)
}

async function updateListing(listingId, listingData) {
  const listing = await db.Listing.findById(listingId)
  if (listing) {
    await listing.update(listingData)
    return _makeListing(listing)
  }
}

module.exports = {
  getListing,
  getListingsById,
  getListingsBySeller,
  getOffer,
  getOffers,
  createListing,
  updateListing
}
