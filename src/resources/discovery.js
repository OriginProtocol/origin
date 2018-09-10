

class Discovery {
  constructor({ discoveryServer, discoveryServerPort, fetch }) {
    this.discoveryServer = discoveryServer
    this.discoveryServerPort = discoveryServerPort
    this.fetch = fetch
  }

  /**
   * Issues a search request to the indexing server which returns Listings result as a promise.
   * This way the caller of the function can implement error checks when results is something
   * unexpected. To get JSON result caller should call `await searchResponse.json()` to get the
   * actual JSON.
   * @param searchQuery {string} general search query
   * @param listingType {string} one of the supported listingTypes
   * @param filters {object} object with properties: name, value, valueType, operator
   * @returns {Promise<HTTP_Response>}
   */
  async search(searchQuery, listingType, filters = []) {
    const query = `
    {
      listings (
        searchQuery: "${searchQuery}"
        filters: [${filters.map(filter => 
  {
    return `
    {
      name: "${filter.name}"
      value: "${String(filter.value)}"
      valueType: ${filter.valueType}
      operator: ${filter.operator}
    }
    `
  }).join(',')}]
      ) {
        nodes {
          id
        }
      }
    }`

    return this.fetch(`${this.discoveryServer}:${this.discoveryServerPort}`, {
      method: 'POST',
      body: JSON.stringify({
        query:query
      }),
      headers: {
        'Content-Type': 'application/json'
      },
    })
  }
}

module.exports = Discovery
