const Sequelize = require('sequelize')

const db = require('../models')


async function getListings(listingIds) {
  // Load wos from Listing table in DB.
  const rows = await db.Listing.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: listingIds
      }
    }
  })
  if (!rows) {
    return []
  }

  // Create a map id -> listing row for ease of lookup.
  let rowDict = {}
  rows.forEach(row => {
    rowDict[row.id] = row
  })

  // Create listing objects to return.
  // Note: we preserve the ordering of passed in listingIds as to not change ranking.
  let listings = []
  listingIds.forEach(id => {
    const row = rowDict[id]
    const listing = {
      id: id,
      ipfsHash: row.data.ipfs.hash,
      data: row.data,
      title: row.data.title,
      description: row.data.description,
      category: row.data.category,
      subCategory: row.data.subCategory,
      // TODO: price may not be defined at listing level for
      // fractional usage (may vary based on time slot).
      price: row.data.price
    }
    listings.push(listing)
  })
  return listings
}

module.exports = { getListings }