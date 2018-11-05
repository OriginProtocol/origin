import AdapterBase from '../adapter-base'
import Money from '../../../models/money'

export default class OfferCompleteAdapterV1 extends AdapterBase {
  /**
   * TODO
   * @param {object} data - Offer data
   * @returns {object} - Offer data
   * @throws {Error} In case data validation fails.
   */
  decode(data) {
    this.validate(data)

    const offer = {

    }

    if (offer.listingType === 'unit') {
      // TODO
    } else if (offer.listingType === 'fractional') {
      // TODO
    } else {
      throw new Error('Unexpected offer type: ${/*TODO*/}')
    }

    return offer
  }
}
