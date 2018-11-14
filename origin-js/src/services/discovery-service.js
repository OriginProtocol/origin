import { Listing } from '../models/listing'
import { Offer } from '../models/offer'
// Max number of results to request from back-end.
const MAX_NUM_RESULTS = 100

class DiscoveryService {
  constructor({ discoveryServerUrl, fetch }) {
    this.discoveryServerUrl = discoveryServerUrl
    this.fetch = fetch
  }

  _toListingModel(listingNode) {
    const data = listingNode.data
    data.display = listingNode.display
    return new Listing(data.listingId, data, {})
  }

  /**
   * Helper method. Calls discovery server and returns response.
   * @param graphQlQuery
   * @return {Promise<*>}
   * @private
   */
  async _query(graphQlQuery) {
    const resp = await this.fetch(
      this.discoveryServerUrl,
      {
        method: 'POST',
        body: JSON.stringify({
          query: graphQlQuery
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      },
      function(error) {
        if (error !== undefined)
          throw Error(
            `An error occurred when reaching discovery server: ${error}`
          )
      }
    )

    if (resp.status !== 200) {
      //TODO: also report error message here
      throw Error(
        `Discovery server returned unexpected status code ${
          resp.status
        } with error `
      )
    }
    return resp.json()
  }

  /**
   * Issues a search request against the discovery server.
   * @param searchQuery {string} General search query
   * @param numberOfItems {number} Max number of items to return.
   * @param offset {number} Pagination offset.
   * @param filters {object} Object with properties: name, value, valueType, operator
   * @return {Promise<list(Object)>}
   */
  async search({ searchQuery, numberOfItems, offset, filters = [] }) {
    // Offset should be bigger than 0.
    offset = Math.max(offset, 0)
    // clamp numberOfItems between 1 and MAX_NUM_RESULTS
    numberOfItems = Math.min(Math.max(numberOfItems, 1), MAX_NUM_RESULTS)
    const query = `
    {
      listings (
        searchQuery: "${searchQuery}"
        filters: [${filters
    .map(filter => {
      return `
    {
      name: "${filter.name}"
      value: "${String(filter.value)}"
      valueType: ${filter.valueType}
      operator: ${filter.operator}
    }
    `
    })
    .join(',')}]
        page:{
          offset: ${offset}
          numberOfItems: ${numberOfItems}
        }
      ) {
        nodes {
          data
          display
        }
        offset
        numberOfItems
        totalNumberOfItems
        stats {
          maxPrice
          minPrice
        }
      }
    }`

    return this._query(query)
  }

  /**
   * Queries discovery server for all listings, with support for pagination.
   * Options:
   *  - idsOnly(boolean): returns only ids rather than the full Listing object.
   *  - listingsFor(address): returns listing created by a specific seller.
   *  - purchasesFor(address): returns listing a specific seller made an offer on.
   * @param opts: { idsOnly, listingsFor, purchasesFor, offset, numberOfItems }
   * @return {Promise<*>}
   */
  async getListings(opts) {
    // Check for incompatible options.
    if (opts.listingsFor && opts.purchasesFor) {
      throw new Error('listingsFor and purchasesFor options are incompatible')
    }

    // Offset should be bigger than 0.
    const offset = Math.max(opts.offset || 0, 0)

    // For numberOfItems, any value between 1 and MAX_NUM_RESULTS is valid.
    // Temporarily, while switching DApp to fetch data from back-end, we use -1 as
    // a special value for requesting all listings. This will get deprecated in the future.
    const numberOfItems = opts.numberOfItems
      ? Math.min(Math.max(opts.numberOfItems, 1), MAX_NUM_RESULTS)
      : -1

    let query, listings
    if (opts.listingsFor) {
      // Query for all listings created by the specified seller address.
      query = `{
        user(walletAddress: "${opts.listingsFor}") {
          listings {
            nodes {
              data
              display
            }
          }
        } 
      }`
      const resp = await this._query(query)
      listings = resp.data.user.listings.nodes.map(listing => this._toListingModel(listing))
    } else if (opts.purchasesFor) {
      // Query for all listings the specified buyer address made an offer on.
      query = `{
        user(walletAddress: "${opts.purchasesFor}") {
          offers {
            nodes {
              listing {
                data
                display
              }
            }
          }
        }
      }`
      const resp = await this._query(query)
      listings = resp.data.user.offers.nodes.map(offer => this._toListingModel(offer.listing))
    } else {
      // General query against all listings. Used for example on Browse and search pages.
      query = `{
        listings(
          filters: []
          page: { offset: ${offset}, numberOfItems: ${numberOfItems} }
        ) {
          nodes {
            data
            display
          }
        }
      }`
      const resp = await this._query(query)
      listings = resp.data.listings.nodes.map(listing => this._toListingModel(listing))
    }

    return opts.idsOnly ? listings.map(listing => listing.id) : listings
  }

  /**
   * Queries discovery server for a listing based on its id.
   * @param listingId
   * @return {Promise<*>}
   */
  async getListing(listingId) {
    const query = `{
      listing(id: "${listingId}") {
        data
        display
      }
    }`
    const resp = await this._query(query)

    // Throw an error if no listing found with this id.
    if (!resp.data) {
      throw new Error(`No listing found with id ${listingId}`)
    }

    return this._toListingModel(resp.data.listing)
  }

  /**
   * Queries discovery server for all offers
   * Options:
   *  - idsOnly(boolean): returns only ids rather than the full Offer object.
   * @param listingId {string}: listing id of a listing to which offer has been made to 
   * @param opts: { idsOnly, for }
   * @return {Promise<*>}
   */
  async getOffers(listingId, opts) {
    const resp = await this._query(`{
      offers(
        ${opts.for ? `buyerAddress: "${opts.for}"`: ''}
        listingId: "${listingId}"
      ) {
        nodes {
          id
          data
        }
      }
    }`)
    
    const offers = resp.data.offers.nodes
      .map(offer => offer.data)
      .map(offer => new Offer(offer.id, listingId, offer))

    return opts.idsOnly ? offers.map(offer => offer.id) : offers
  }
}

export default DiscoveryService
