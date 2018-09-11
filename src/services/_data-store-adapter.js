import Ajv from 'ajv'
import URL from 'url-parse'

import Money from '../utils/money'

import listingSchemaV1 from '../schemas/listing-core.json'
import offerSchemaV1 from '../schemas/offer.json'
import reviewSchemaV1 from '../schemas/review.json'

const ajv = new Ajv({allErrors: true})
// To use the draft-06 JSON schema, we need to explicitly add it to ajv.
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
ajv.addSchema([
  listingSchemaV1,
  offerSchemaV1,
  reviewSchemaV1
])

class AdapterBase {
  constructor(dataType, schemaId, schemaVersion) {
    Object.assign(this, {dataType, schemaId, schemaVersion})
  }
  /**
   * Validates the data is compliant with Origin Protocol schema.
   * @throws {Error} If validation fails.
   */
  validate(data) {
    if (data.schemaVersion !== this.schemaVersion) {
      throw new Error(`Unexpected schema version: ${data.schemaVersion} != ${this.schemaVersion}`)
    }

    const validator = ajv.getSchema(this.schemaId)
    if (!validator(data)) {
      throw new Error(
        `Data failed schema validation.
        Data type: ${this.dataType}
        Schema id: ${this.schemaId}
        Schema version: ${this.schemaVersion}
        Data: ${JSON.stringify(data)}.
        Errors: ${JSON.stringify(validator.errors)}`
      )
    }
  }

  /**
   * Encodes data before storage.
   * This default encode method assumes data is already in proper format and just validates it.
   * @param data
   * @return {object} - Data to be written in storage.
   */
  encode(data) {
    this.validate(data)
    return data
  }

  /**
   * Decodes data coming from storage. Must be implemented by derived class.
   * @param ipfsData
   */
  decode(ipfsData) {
    throw new Error(`Implement me. Cannot call decode with ${ipfsData} on AdapterBase`)
  }
}

class ListingAdapterV1 extends AdapterBase {

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
          return ['data:', 'dweb:', 'ipfs:'].includes(new URL(medium.url).protocol)
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
      schemaVersion:  ipfsData.schemaVersion,
      type:           ipfsData.listingType,
      category:       ipfsData.category,
      subCategory:    ipfsData.subCategory,
      language:       ipfsData.language,
      title:          ipfsData.title,
      description:    ipfsData.description,
      media:          ipfsData.media,
      expiry:         ipfsData.expiry,
    }

    // Unit data.
    if (listing.type === 'unit') {
      listing.unitsTotal = ipfsData.unitsTotal
      listing.price = new Money(ipfsData.price)
      listing.commission = ipfsData.commission ? new Money(ipfsData.commission) : null
      listing.securityDeposit = ipfsData.securityDeposit ? new Money(ipfsData.securityDeposit) : null
    } else if (listing.type === 'fractional') {
      // TODO(franck): fill this in.
    } else {
      throw new Error(`Unexpected listing type: ${listing.type}`)
    }

    return listing
  }
}

class OfferAdapterV1 extends AdapterBase {
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
      schemaVersion: ipfsData.schemaVersion,
      listingType: ipfsData.listingType,
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

class ReviewAdapterV1 extends AdapterBase {
  /**
   * Populates an IpfsReview object based on review data encoded using V1 schema.
   * @param {object} data - Listing data, expected to use schema V1.
   * @returns {object} - Offer data
   * @throws {Error} In case data validation fails.
   */
  decode(ipfsData) {
    // Validate the data coming out of storage.
    this.validate(ipfsData)

    const review = {
      rating:  ipfsData.rating,
      text:    ipfsData.text,
    }

    return review
  }
}

const adapterConfig = {
  'listing': {
    '1.0.0': {
      schemaId: 'http://schema.originprotocol.com/listing-core-v1.0.0',
      adapter: ListingAdapterV1
    }
  },
  'offer': {
    '1.0.0': {
      schemaId: 'http://schema.originprotocol.com/offer-v1.0.0',
      adapter: OfferAdapterV1
    }
  },
  'review': {
    '1.0.0': {
      schemaId: 'http://schema.originprotocol.com/review-v1.0.0',
      adapter: ReviewAdapterV1
    }
  }
}

/**
 * Returns an adapter based on a data type and version.
 * @param {string} dataType - 'listing', 'offer', 'review'
 * @param {string} schemaVersion
 * @returns {SchemaAdapter}
 * @throws {Error}
 */
export function dataAdapterFactory(dataType, schemaVersion) {
  if (!adapterConfig[dataType]) {
    throw new Error(`Unsupported data type: ${dataType}`)
  }
  if (!adapterConfig[dataType][schemaVersion]) {
    throw new Error(`Unsupported schema version ${schemaVersion} for type ${dataType}`)
  }
  const {schemaId, adapter } = adapterConfig[dataType][schemaVersion]
  return new adapter(dataType, schemaId, schemaVersion)
}