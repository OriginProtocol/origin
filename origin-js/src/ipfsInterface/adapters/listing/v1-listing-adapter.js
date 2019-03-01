import AdapterBase from '../adapter-base'
import Money from '../../../models/money'
import URL from 'url-parse'

export default class ListingAdapterV1 extends AdapterBase {
  /**
   * Rewrites IPFS media URLs to point to the configured IPFS gateway.
   * Applied after loading data from storage and decoding it.
   */
  postProcessor(listing, ipfsService) {
    if (!listing.media) {
      return
    }
    for (const medium of listing.media) {
      medium.url = ipfsService.rewriteUrl(medium.url)
    }
  }

  /**
   * Uploads to IPFS content passed in as data URL.
   * Applied before encoding data and writing it to storage.
   */
  async preProcessor(listing, ipfsService) {
    if (!listing.media) {
      return
    }

    // Only allow data:, dweb:, and ipfs: URLs
    listing.media = listing.media.filter(medium => {
      if (medium.url) {
        try {
          return ['data:', 'dweb:', 'ipfs:'].includes(
            new URL(medium.url).protocol
          )
        } catch (error) {
          // Invalid URL, filter it out
          return false
        }
      } else {
        // No url. Invalid entry.
        return false
      }
    })

    // Upload any data URL content to IPFS.
    const uploads = listing.media.map(async medium => {
      if (medium.url.startsWith('data:')) {
        const ipfsHash = await ipfsService.saveDataURIAsFile(medium.url)
        medium.url = `ipfs://${ipfsHash}`
      }
    })
    return Promise.all(uploads)
  }

  /**
   * Populates an IpfsListing object based on listing data encoded with V1 schema.
   * @param {object} ipfsData - Listing data read from IPFS.
   * @returns {object} - Listing data.
   * @throws {Error}
   */
  decode(ipfsData) {
    // Validate the data coming out of storage.
    this.validate(ipfsData)

    const listing = {
      schemaId: ipfsData.schemaId,
      dappSchemaId: ipfsData.dappSchemaId,
      type: ipfsData.listingType,
      category: ipfsData.category,
      subCategory: ipfsData.subCategory,
      language: ipfsData.language,
      title: ipfsData.title,
      description: ipfsData.description,
      media: ipfsData.media,
      marketplacePublisher: ipfsData.marketplacePublisher,
      createDate: ipfsData.createDate,
      updateVersion: ipfsData.updateVersion,
      creator: ipfsData.creator
    }

    // Unit data.
    if (listing.type === 'unit') {
      listing.unitsTotal = ipfsData.unitsTotal
      listing.price = new Money(ipfsData.price)
      listing.commission = ipfsData.commission
        ? new Money(ipfsData.commission)
        : null
      listing.commissionPerUnit = ipfsData.commissionPerUnit
        ? new Money(ipfsData.commissionPerUnit)
        : null
    } else if (listing.type === 'fractional') {
      listing.availability = ipfsData.availability
      listing.slotLength = ipfsData.slotLength
      listing.slotLengthUnit = ipfsData.slotLengthUnit
      listing.commission = ipfsData.commission
        ? new Money(ipfsData.commission)
        : null
    } else {
      throw new Error(`Unexpected listing type: ${listing.type}`)
    }

    return listing
  }
}
