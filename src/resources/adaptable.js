import V00_MarkeplaceAdapter from '../adapters/marketplace/v00'
import V01_MarkeplaceAdapter from '../adapters/marketplace/v01'
import { parseListingId, parseOfferId } from '../utils/id'

class Adaptable {
  constructor(args) {
    this.adapters = {
      '000': new V00_MarkeplaceAdapter(args),
      '001': new V01_MarkeplaceAdapter(args)
    }
    this.versions = ['000', '001']
    this.currentVersion = this.versions[this.versions.length - 1]
    this.currentAdapter = this.adapters[this.currentVersion]
  }

  parseListingId(listingId) {
    const { version, network, listingIndex } = parseListingId(listingId)
    // use appropriate adapter for version
    const adapter = this.adapters[version]
    if (!adapter) {
      throw new Error(`Adapter not found for version ${version}`)
    }
    return { adapter, listingIndex, version, network }
  }

  parseOfferId(offerId) {
    const { version, network, listingIndex, offerIndex } = parseOfferId(offerId)
    // use appropriate adapter for version
    const adapter = this.adapters[version]
    if (!adapter) {
      throw new Error(`Adapter not found for version ${version}`)
    }
    return { adapter, listingIndex, offerIndex, version, network }
  }
}

module.exports = Adaptable
