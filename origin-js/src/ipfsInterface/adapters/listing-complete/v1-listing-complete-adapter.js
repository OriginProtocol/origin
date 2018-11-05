import AdapterBase from '../adapter-base'
import Money from '../../../models/money'

export default class ListingCompleteAdapterV1 extends AdapterBase {
  /**
   * TODO
   * @param {object} data - Listing data
   * @returns {object} - Listing data
   * @throws {Error} In case data validation fails.
   */
  decode(data) {
    this.validate(data)

    const listing = {

    }

    if (listing.listingType === 'unit') {
      // TODO
    } else if (listing.listingType === 'fractional') {
      // TODO
    } else {
      throw new Error('Unexpected listing type: ${/*TODO*/}')
    }

    return listing
  }
}
