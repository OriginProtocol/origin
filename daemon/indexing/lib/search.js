var elasticsearch = require('elasticsearch')

/*
  Module to interface with ElasticSearch.
 */


// TODO(franck): dynamically configure client.
var client = new elasticsearch.Client({
  hosts: [
    'elasticsearch:9200/'
  ]
})

// Name of the index used for storing Origin data.
const indexName = 'origin'

// Name of the index type used for storing listings data.
const listingsType = 'listing'


class Cluster {
  /*
   * Gets cluster health and prints it.
   */
  static async health() {
    const resp = await client.cluster.health({})
    console.log('-- Search cluster health --\n', resp)
  }

  /*
   * Creates the Origin index.
   */
  static async createIndex() {
    await client.indices.create({index: indexName})
    console.log(`Created search index ${indexName}`)
  }

  /*
   * Deletes the Origin index.
   */
  static async deleteIndex() {
    await client.indices.delete({index: indexName})
  }
}


class Listing {
  /*
   * Counts number of listings indexed.
   * @returns The number of listings indexed.
   */
  static async count() {
    const resp = await client.count({index: indexName, type: listingsType})
    console.log(`Counted ${resp.count} listings in the search index.`)
    return resp.count
  }

  /*
   * Indexes a listing.
   * @params {string} listingId - The unique ID of the listing.
   * @params {object} listing - Listing to index.
   * @throws Throws an error if indexing operation failed.
   * @returns The listingId indexed.
   */
  static async index(listingId, listing) {
    const resp = await client.index({
      index: indexName,
      id: listingId,
      type: listingsType,
      body: listing
    })
    console.log(`Indexed listing ${listingId} in search index.`)
    return listingId
  }

  /*
   * Searches for listings.
   * @params {string} query - The search query.
   * @throws Throws an error if the search operation failed.
   * @returns A list of listings (can be empty).
   */
  static async search(query) {
    const resp = await client.search({
      index: indexName,
      type: listingsType,
      // TODO(franck): update query to search against other fields than just description.
      body: {
        query: {
          match: {'description': query}
        },
      }
    })
    const listings = []
    resp.hits.hits.forEach((hit) => {
      const listing = {
        id: hit._id,
        name: hit._source.name,
        description: hit._source.description,
        price: hit._source.price,
      }
      listings.push(listing)
    })
    return listings
  }
}


module.exports = {
  Cluster,
  Listing,
}
