// Request at most 100 results from the back-end.
const MAX_NUM_RESULTS = 100

class DiscoveryService {
  constructor({ discoveryServerUrl, fetch }) {
    this.discoveryServerUrl = discoveryServerUrl
    this.fetch = fetch
  }

  /**
   * Helper method. Calls discovery server and returns response.
   * @param graphQlQuery
   * @return {Promise<*>}
   * @private
   */
  async _query(graphQlQuery){
    const url = this.discoveryServerUrl
    const resp = await this.fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          query: graphQlQuery
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      },
      function(error){
        if (error !== undefined)
          throw Error(`An error occurred when reaching discovery server: ${error}`)
      })

    if(resp.status !== 200){
      //TODO: also report error message here
      throw Error(`Discovery server returned unexpected status code ${resp.status} with error `)
    }
    return await resp.json()
  }

  /**
   * Queries back-end for all listings, with support for pagination.
   * @param opts: { idsOnly, listingsFor, purchasesFor, offset, numberOfItems }
   * @return {Promise<*>}
   */
  async listings(opts) {
    // Offset should be bigger than 0.
    const offset = Math.max(opts.offset || 0, 0)
    // clamp numberOfItems between 1 and MAX_NUM_RESULTS.
    const numberOfItems = Math.min(Math.max(opts.numberOfItems || 0, 1), MAX_NUM_RESULTS)

    // TODO: pass listingsFor, purchasesFor as filters
    const query = `{
      listings(
        filters: []
        page: { offset: ${offset}, numberOfItems: ${numberOfItems}}
      ) {
        nodes {
          id
          data
        }
      }
    }`

    const resp = await this._query(query)
    if (opts.idsOnly) {
      return resp.data.listings.nodes.map(listing => listing.id)
    } else {
      return resp.data.listings.nodes.map(listing => listing.data)
    }
  }
}

export default DiscoveryService