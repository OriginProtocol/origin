class Discovery {
  constructor({ discoveryServerUrl, fetch }) {
    this.discoveryServerUrl = discoveryServerUrl
    this.fetch = fetch
  }

  async query(graphQlQuery){
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
        throw Error(`An error occured when reaching discovery server: ${error}`)  
    })

    if(resp.status !== 200){
      //TODO: also report error message here
      throw Error(`Discovery server retuned unexpected status code ${resp.status} with error `)
    }
    return await resp.json()
  }

  /**
   * Issues a search request to the indexing server which returns Listings result as a promise.
   * This way the caller of the function can implement error checks when results is something
   * unexpected. To get JSON result caller should call `await searchResponse.json()` to get the
   * actual JSON.
   * @param searchQuery {string} general search query
   * @param filters {object} object with properties: name, value, valueType, operator
   * @returns {Promise<HTTP_Response>}
   */
  async search(searchQuery, numberOfItems, offset, filters = []) {
    // from page should be bigger than 0
    offset = Math.max(offset, 0)
    // clamp numberOfItems between 1 and 12
    numberOfItems = Math.min(Math.max(numberOfItems, 1), 100)
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
          id
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

    return this.query(query)
  }
}

module.exports = Discovery
