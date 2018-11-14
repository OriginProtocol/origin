import Ajv from 'ajv'

import listingSchema from './schemas/listing.json'
import listingWithdrawnSchema from './schemas/listing-withdraw.json'
import offerSchema from './schemas/offer.json'
import offerWithdrawnSchema from './schemas/offer-withdraw.json'
import offerAcceptedSchema from './schemas/offer-accept.json'
import disputeSchema from './schemas/dispute.json'
import resolutionSchema from './schemas/resolution.json'
import profileSchema from './schemas/profile.json'
import reviewSchema from './schemas/review.json'

const ajv = new Ajv({ allErrors: true })
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
ajv.addSchema([
  listingSchema,
  listingWithdrawnSchema,
  offerSchema,
  offerWithdrawnSchema,
  offerAcceptedSchema,
  disputeSchema,
  resolutionSchema,
  profileSchema,
  reviewSchema
])

export default function validate(schemaId, data) {
  const validator = ajv.getSchema(schemaId)
  if (!validator) {
    throw new Error(`Failed loading schema validator for ${schemaId}`)
  }
  if (!validator(data)) {
    throw new Error(ajv.errorsText(validator.errors))
  }
}
