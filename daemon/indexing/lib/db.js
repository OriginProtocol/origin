const { Pool } = require('pg')

/*
  Module to interface with Postgres database.
 */

// TODO(franck): dynamically configure client.
const pool = new Pool(
  {
    host: 'postgres',
    database: 'origin-indexing',
    user: 'origin',
    password: 'origin',
  })


class Listing {
  /*
  * Returns the row from the listing table with the specified id.
  * @throws Throws an error if the read operation failed.
  * @returns A row or undefined if no row found with the specified listingId.
  */
  static async get(listingId) {
    const res = await pool.query(`SELECT * FROM ${Listing.table} WHERE id=$1`, [listingId])
    return (res.rows.length > 0) ? res.rows[0] : undefined
  }

  /*
   * Returns all rows from the listing table.
   * @throws Throws an error if the read operation failed.
   * @returns A list of rows.
   *
   * TODO(franck): add support for pagination.
   */
  static async all() {
    const res = await pool.query(`SELECT * FROM ${Listing.table}`, [])
    // Match the format of the data coming from elasticsearch
    const results = res.rows.map((row)=>{
      const json = JSON.parse(row.data)
      return {
        id: row.id,
        name: json.name,
        description: json.description,
        price: json.price
      }
    })
    return results
  }

  /*
   * Inserts a row into the listing table.
   * @params {string} listingId - The unique ID of the listing.
   * @params {string} sellerAddress - ETH address of the seller.
   * @params {string} ipfsHash - 32 bytes IPFS hash, in hexa (not base58 encoded).
   * @params {object} data - Listing's JSON data.
   * @throws Throws an error if the operation failed.
   * @returns The listingId indexed.
   */
  static async insert(listingId, sellerAddress, ipfsHash, data) {
    // TODO: Check that we are not replacing new data with old
    const res = await pool.query(
      `INSERT INTO ${Listing.table}(id, seller_address, ipfs_hash, data) VALUES($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET data = excluded.data`, [listingId, sellerAddress, ipfsHash, data])
    console.log(`Added row ${listingId} to listing table.`)
    return listingId
  }
}

class Offer {
  /*
  * Returns all offer rows for a given tuple (listingId, offerId).
  * @throws Throws an error if the read operation failed.
  * @returns A row or undefined if no row found with the specified offerId.
  */
  static async get(listingId, offerId) {
    const res = await pool.query(
      `SELECT * FROM ${Offer.table} WHERE listing_id=$1 AND offer_id=$2`, [listingId, offerId])
    return res.rows
  }

  /*
  * Returns all offers for the given listing Id.
  * @throws Throws an error if the read operation failed.
  * @returns A list of rows.
  */
  static async getByListingId(listingId) {
    const res = await pool.query(`SELECT * FROM ${Offer.table} WHERE listing_id=$1`, [listingId])
    return res.rows
  }

  /*
   * Returns all rows from the offer table.
   * @throws Throws an error if the read operation failed.
   * @returns A list of rows.
   *
   * TODO(franck): add support for pagination.
   */
  static async all() {
    const res = await pool.query(`SELECT * FROM ${Offer.table}`, [])
    return res.rows
  }

  /*
   * Inserts a row into the offer table.
   * @params {string} offerId - The unique ID of the offer.
   * @params {string} listingId - Id of the listing the offer is associated with.
   * @params {boolean} status - Offer status.
   * @params {string} sellerAddress - ETH address of the seller.
   * @params {string} buyerAddress - ETH address of the buyer.
   * @params {string} ipfsHash - 32 bytes IPFS hash, in hexa (not base58 encoded).
   * @params {object} data - Offer's JSON data.
   * @throws Throws an error if the operation failed.
   * @returns The tuple [listingId, offerId, status] indexed.
   */
  static async insert(listingId, offerId, status, sellerAddress, buyerAddress, ipfsHash, data) {
    // TODO: Check that we are not replacing new data with old
    const res = await pool.query(
      `INSERT INTO ${Offer.table}
      (listing_id, offer_id, status, seller_address, buyer_address, ipfs_hash, data)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (listing_id, offer_id, status) DO UPDATE SET data = excluded.data`,
      [listingId, offerId, status, data])
    console.log(`Added row ${listingId}/${offerId}/${status} to offer table.`)
    return [listingId, offerId, status]
  }
}

// Ugly workaround since JS does not allow class variables.
Listing.table = 'listing'
Offer.tabe = 'offer'

module.exports = {
  Listing,
  Offer,
}
