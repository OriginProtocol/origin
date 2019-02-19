import DisputeAdapterV1 from './dispute/v1-dispute-adapter'
import IdentityAdapterV1 from './identity/v1-identity-adapter'
import ListingAdapterV1 from './listing/v1-listing-adapter'
import ListingWithdrawAdapterV1 from './listing-withdraw/v1-listing-withdraw-adapter'
import OfferAdapterV1 from './offer/v1-offer-adapter'
import OfferAcceptAdapterV1 from './offer-accept/v1-offer-accept-adapter'
import OfferWithdrawAdapterV1 from './offer-withdraw/v1-offer-withdraw-adapter'
import ProfileAdapterV1 from './profile/v1-profile-adapter'
import ResolutionAdapterV1 from './resolution/v1-resolution-adapter'
import ReviewAdapterV1 from './review/v1-review-adapter'


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
  },
  'identity': {
    '1.0.0': IdentityAdapterV1,
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
export default function adapterFactory(schemaId, dataType, schemaVersion) {
  if (!adapterConfig[dataType]) {
    throw new Error(`Unsupported data type: ${dataType}`)
  }
  if (!adapterConfig[dataType][schemaVersion]) {
    throw new Error(
      `Unsupported schema version ${schemaVersion} for data type ${dataType}`
    )
  }
  const adapter = adapterConfig[dataType][schemaVersion]
  return new adapter(dataType, schemaVersion)
}
