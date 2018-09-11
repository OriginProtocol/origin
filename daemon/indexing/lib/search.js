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

// Elasticsearch index and type names for our data
// Elasticsearch is depreciating storing different types in the same index.
// (and forbids it unless you enable a special flag)
const LISTINGS_INDEX = 'listings'
const LISTINGS_TYPE = 'listing'
const OFFER_INDEX = 'offers'
const OFFER_TYPE = 'offer'
const USER_INDEX = 'users'
const USER_TYPE = 'user'


class Cluster {
  /**
   * Gets cluster health and prints it.
   */
  static async health() {
    const resp = await client.cluster.health({})
    console.log('-- Search cluster health --\n', resp)
  }
}


class Listing {
  /**
   * Counts number of listings indexed.
   * @returns The number of listings indexed.
   */
  static async count() {
    const resp = await client.count({index: LISTINGS_INDEX, type: LISTINGS_TYPE})
    console.log(`Counted ${resp.count} listings in the search index.`)
    return resp.count
  }

  static async get(id) {
    const resp = await client.get({id: id, index: LISTINGS_INDEX, type: LISTINGS_TYPE})
    if(!resp.found){
      throw Error("Listing not found")
    }
    const listing = resp._source
    listing.id = id
    return resp._source
  }

  /**
   * Indexes a listing.
   * @param {string} listingId - The unique ID of the listing.
   * @param {string} buyerAddress - ETH address of the buyer.
   * @param {string} ipfsHash - 32 bytes IPFS hash, in hexa (not base58 encoded).
   * @param {object} listing - JSON listing data.
   * @throws Throws an error if indexing operation failed.
   * @returns The listingId indexed.
   */
  static async index(listingId, buyerAddress, ipfsHash, listing) {
    const resp = await client.index({
      index: LISTINGS_INDEX,
      id: listingId,
      type: LISTINGS_TYPE,
      body: listing
    })
    console.log(`Indexed listing ${listingId} in search index.`)
    return listingId
  }

  /**
   * Searches for listings.
   * @param {string} query - The search query.
   * @throws Throws an error if the search operation failed.
   * @returns A list of listings (can be empty).
   */
  static async search(query) {
    const esQuery = {}
    if (query !== undefined){
      esQuery.match = {'description': query}
    } else {
      esQuery.match_all = {}
    }
    const resp = await client.search({
      index: LISTINGS_INDEX,
      type: LISTINGS_TYPE,
      // TODO(franck): update query to search against other fields than just description.
      body: {
        query: esQuery,
      }
    })
    const listings = []
    resp.hits.hits.forEach((hit) => {
      const listing = {
        id: hit._id,
        title: hit._source.title,
        category: hit._source.category,
        subCategory: hit._source.subCategory,
        description: hit._source.description,
        priceAmount: (hit._source.price||{}).amount,
        priceCurrency: (hit._source.price||{}).currency,
      }
      listings.push(listing)
    })
    return listings
  }
}

class Offer {
  /**
   * Indexes an Offer
   * @param {object} offer - JSON offer data from origin.js
   * @throws Throws an error if indexing operation failed. 
   */
  static async index(offer, listing){
    const resp = await client.index({
      index: OFFER_INDEX,
      type: OFFER_TYPE,
      id: offer.id,
      body: {
        id: offer.id,
        listingId: offer.listingId,
        buyer: offer.buyer,
        seller: listing.seller,
        affiliate: offer.affiliate,
        priceEth: offer.priceEth,
        status: offer.status
      }
    })
  }

  static async get(id) {
    const resp = await client.get({id: id, index: OFFER_INDEX, type: OFFER_TYPE})
    if(!resp.found){
      throw Error("Offer not found")
    }
    return resp._source
  }

  static async search(opts) {
    let mustQueries = []
    if (opts.buyerAddress !== undefined) {
      mustQueries.push({term: {'buyer.keyword': opts.buyerAddress}})
    }
    if (opts.listingId !== undefined) {
      mustQueries.push({term: {'listingId.keyword': opts.listingId}})
    }
    let query
    if (mustQueries.length > 0){
      query = {bool: {must: mustQueries}}
    } else{
      query = {match_all: {}}
    }

    const resp = await client.search({
      index: OFFER_INDEX,
      type: OFFER_TYPE,
      body: {
        query,
      }
    })
    return resp.hits.hits.map(x=>x._source)
  }
}


class User {
  /**
   * Indexes a user
   * @param {object} user - JSON user data from origin.js 
   */
  static async index(user){
    const profile = user.profile || {}
    const resp = await client.index({
      index: USER_INDEX,
      type: USER_TYPE,
      id: user.address,
      body: {
        walletAddress: user.address,
        identityAddress: user.identityAddress,
        firstName: profile.firstName,
        lastName: profile.lastName,
        description: profile.description,
      }
    })
  }

  static async get(walletAddress) {
    const resp = await client.get({id: walletAddress, index: USER_INDEX, type: USER_TYPE})
    if(!resp.found){
      throw Error("User not found")
    }
    return resp._source
  }
}


module.exports = {
  Cluster,
  Listing,
  Offer,
  User
}
