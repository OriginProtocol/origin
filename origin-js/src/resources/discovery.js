export default class Discovery {
  constructor({ discoveryService }) {
    this.discoveryService = discoveryService
  }

  async search(searchQuery, numberOfItems, offset, filters = []) {
    return this.discoveryService.search(searchQuery, numberOfItems, offset, filters)
  }
}
