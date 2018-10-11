import AdapterBase from '../adapter-base'
import Money from '../../../models/money'

export default class OfferAdapterV1 extends AdapterBase {
  /**
   * Populates an IpfsOffer object based on offer data encoded using V1 schema.
   * @param {object} data - Listing data, expected to use schema V1.
   * @returns {object} - Offer data
   * @throws {Error} In case data validation fails.
   */
  decode(ipfsData) {
    // Validate the data coming out of storage.
    this.validate(ipfsData)

    const offer = {
      schemaId: ipfsData.schemaId,
      listingType: ipfsData.listingType
    }

    // Unit data.
    if (offer.listingType === 'unit') {
      offer.unitsPurchased = ipfsData.unitsPurchased
      offer.totalPrice = new Money(ipfsData.totalPrice)
    } else if (offer.listingType === 'fractional') {
      // TODO(franck): fill this in.
    } else {
      throw new Error(`Unexpected listing type: ${offer.listingType}`)
    }

    return offer
  }
}
