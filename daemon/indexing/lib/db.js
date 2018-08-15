const { Pool } = require('pg')

/*
  Module to interface with Postgres database.
 */

// TODO(franck): dynamically configure client.
const pool = new Pool(
  {
    host: 'postgres',
    database: 'indexing',
    user: 'origin',
    password: 'origin',
  })


class Listing {
  /*
  * Returns all rows from the listing table.
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
   * @params {object} listing - Listing to add.
   * @throws Throws an error if the operation failed.
   * @returns The listingId indexed.
   */
  static async insert(listingId, listing) {
    // TODO: Check that we are not replacing new data with old
    const res = await pool.query(
      `INSERT INTO ${Listing.table}(id, data) VALUES($1, $2)
      ON CONFLICT (id) DO UPDATE SET data = excluded.data`, [listingId, listing])
    console.log(`Added row ${listingId} to listing table.`)
    return listingId
  }
}

Listing.table = 'listing' // Ugly workaround since JS does not allow class variables.

module.exports = {
  Listing,
}
