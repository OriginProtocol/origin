class Discovery {
  constructor({ discoveryService }) {
    this.discoveryService = discoveryService
  }

  async search(searchQuery, numberOfItems, offset, filters = []) {
    return this.discoveryService.search(searchQuery, numberOfItems, offset, filters)
  }

  async listings(opts) {
    return this.discoveryService.listings(opts)
  }

  async listing(listingId) {
    return this.discoveryService.listing(listingId)
  }
}

module.exports = Discovery
