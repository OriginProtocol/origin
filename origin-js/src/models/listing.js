//
// Listing is the main object exposed by Origin Protocol to access listing data.
//
export class Listing {
  /**
   * A Listing is constructed based on its on-chain and off-chain data.
   * @param {string} listingId - Unique listing ID.
   * @param {Object} chainListing - Listing data from the blockchain.
   * @param {Object} ipfsListing - Listing data from IPFS.
   */
  constructor(listingId, chainListing, ipfsListing) {
    this.id = listingId
    // FIXME(franck): Exposing directly the chain data will make it difficult
    // to support backward compatibility of the Listing interface in the future. We should
    // select and possibly abstract what data from the chain gets exposed.
    Object.assign(this, ipfsListing, chainListing)
  }

  get unitsSold() {
    // Lazy caching.
    if (this._unitsSold !== undefined) {
      return this._unitsSold
    }
    this._unitsSold = Object.keys(this.offers).reduce((acc, offerId) => {
      if (this.offers[offerId].status === 'created') {
        return acc + 1
      }
      // TODO: we need to subtract 1 for every offer that is canceled
      return acc
    }, 0)
    return this._unitsSold
  }

  get unitsRemaining() {
    // Should never be negative.
    return Math.max(this.unitsTotal - this.unitsSold, 0)
  }

  get active() {
    return this.status === 'active'
  }

}
