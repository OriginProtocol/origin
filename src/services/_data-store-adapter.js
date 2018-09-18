import Ajv from 'ajv'
import URL from 'url-parse'

import Money from '../models/money'

import listingSchemaV1 from '../schemas/listing.json'
import listingWithdrawnSchemaV1 from '../schemas/listing-withdraw.json'
import offerSchemaV1 from '../schemas/offer.json'
import offerWithdrawnSchemaV1 from '../schemas/offer-withdraw.json'
import offerAcceptedSchemaV1 from '../schemas/offer-accept.json'
import disputeSchemaV1 from '../schemas/dispute.json'
import resolutionSchemaV1 from '../schemas/resolution.json'
import profileSchemaV1 from '../schemas/profile.json'
import reviewSchemaV1 from '../schemas/review.json'


const ajv = new Ajv({ allErrors: true })
// To use the draft-06 JSON schema, we need to explicitly add it to ajv.
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
ajv.addSchema([
  listingSchemaV1,
  listingWithdrawnSchemaV1,
  offerSchemaV1,
  offerWithdrawnSchemaV1,
  offerAcceptedSchemaV1,
  disputeSchemaV1,
  resolutionSchemaV1,
  profileSchemaV1,
  reviewSchemaV1
])

class AdapterBase {
  constructor(schemaId) {
    this.schemaId = schemaId
  }

  /**
   * Validates the data is compliant with Origin Protocol schema.
   * @throws {Error} If validation fails.
   */
  validate(data) {
    if (data.schemaId !== this.schemaId) {
      throw new Error(
        `Unexpected schema version: ${data.schemaId} != ${
          this.schemaId
        }`
      )
    }

    const validator = ajv.getSchema(this.schemaId)
    if (!validator) {
      throw new Error(`Failed loading schema validator for ${this.schemaId}`)
    }
    if (!validator(data)) {
      throw new Error(
        `Data failed schema validation.
        Schema id: ${this.schemaId}
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
   * Decodes data coming from storage.
   * In most cases derived class should override this default implementation which
   * validates the data against the schema and returns it without any alteration.
   * @param ipfsData
   */
  decode(ipfsData) {
    this.validate(ipfsData)
    return Object.assign({}, ipfsData)
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
      type: ipfsData.listingType,
      category: ipfsData.category,
      subCategory: ipfsData.subCategory,
      language: ipfsData.language,
      title: ipfsData.title,
      description: ipfsData.description,
      media: ipfsData.media,
      expiry: ipfsData.expiry
    }

    // Unit data.
    if (listing.type === 'unit') {
      listing.unitsTotal = ipfsData.unitsTotal
      listing.price = new Money(ipfsData.price)
      listing.commission = ipfsData.commission
        ? new Money(ipfsData.commission)
        : null
      listing.securityDeposit = ipfsData.securityDeposit
        ? new Money(ipfsData.securityDeposit)
        : null
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

class ListingWithdrawAdapterV1 extends AdapterBase {}

class OfferAcceptAdapterV1 extends AdapterBase {}

class DisputeAdapterV1 extends AdapterBase {}

class ResolutionAdapterV1 extends AdapterBase {}

class OfferWithdrawAdapterV1 extends AdapterBase {}

class ProfileAdapterV1 extends AdapterBase {}

class ReviewAdapterV1 extends AdapterBase {}


const adapterConfig = {
  'listing': {
    '1.0.0': ListingAdapterV1
  },
  'listing-withdraw': {
    '1.0.0': ListingWithdrawAdapterV1
  },
  'offer': {
    '1.0.0': OfferAdapterV1,
  },
  'offer-withdraw': {
    '1.0.0': OfferWithdrawAdapterV1
  },
  'offer-accept': {
    '1.0.0': OfferAcceptAdapterV1,
  },
  'dispute': {
    '1.0.0': DisputeAdapterV1,
  },
  'resolution': {
    '1.0.0': ResolutionAdapterV1,
  },
  'profile': {
    '1.0.0': ProfileAdapterV1,
  },
  'review': {
    '1.0.0': ReviewAdapterV1,
  }
}

/**
 * Returns an adapter based on a data type and version.
 * @param {string} schemaId - Unique ID of the schema to use.
 * @param {string} dataType - 'listing', 'offer', 'review', etc...
 * @param {string} schemaVersion - version of the schema to use.
 * @returns {SchemaAdapter}
 * @throws {Error}
 */
export function dataAdapterFactory(schemaId, dataType, schemaVersion) {
  if (!adapterConfig[dataType]) {
    throw new Error(`Unsupported data type: ${dataType}`)
  }
  if (!adapterConfig[dataType][schemaVersion]) {
    throw new Error(
      `Unsupported schema version ${schemaVersion} for data type ${dataType}`
    )
  }
  const adapter = adapterConfig[dataType][schemaVersion]
  return new adapter(schemaId)
}
