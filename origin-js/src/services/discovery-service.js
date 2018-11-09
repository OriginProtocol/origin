// Max number of results to request from back-end.
const MAX_NUM_RESULTS = 100

class DiscoveryService {
  constructor({ discoveryServerUrl, fetch }) {
    this.discoveryServerUrl = discoveryServerUrl
    this.fetch = fetch
  }

  _flattenListingData(listingNode) {
    const data = listingNode.data
    data.display = listingNode.display
    return data
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
   * @param opts: { idsOnly, listingsFor, purchasesFor, offset, numberOfItems }
   * @return {Promise<*>}
   */
  async getListings(opts) {
    // Offset should be bigger than 0.
    const offset = Math.max(opts.offset || 0, 0)

    // For numberOfItems, any value between 1 and MAX_NUM_RESULTS is valid.
    // Temporarily, while switching DApp to fetch data from back-end, we use -1 as
    // a special value for requesting all listings. This will get deprecated in the future.
    const numberOfItems = opts.numberOfItems
      ? Math.min(Math.max(opts.numberOfItems, 1), MAX_NUM_RESULTS)
      : -1

    // TODO: pass listingsFor, purchasesFor as filters
    const query = `{
      listings(
        filters: []
        page: { offset: ${offset}, numberOfItems: ${numberOfItems}}
      ) {
        nodes {
          data
          display
        }
      }
    }`

    const resp = await this._query(query)
    if (opts.idsOnly) {
      return resp.data.listings.nodes.map(listing => listing.data.id)
    } else {
      return resp.data.listings.nodes.map(listing => this._flattenListingData(listing))
    }
  }

  /**
   * Queries discovery server for a listing based on its id.
   * @param listingId
   * @return {Promise<*>}
   */
  async getListing(listingId) {
    const query = `{
      listing(id: "${listingId}") {
        id
        data
        display
      }
    }`
    const resp = await this._query(query)

    // Throw an error if no listing found with this id.
    if (!resp.data) {
      throw new Error(`No listing found with id ${listingId}`)
    }

    return this._flattenListingData(resp.data.listing)
  }
}

export default DiscoveryService
