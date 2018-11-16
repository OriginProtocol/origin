const Ajv = require('ajv')

const listingSchema = require('./schemas/listing.json')
const listingWithdrawnSchema = require('./schemas/listing-withdraw.json')
const offerSchema = require('./schemas/offer.json')
const offerWithdrawnSchema = require('./schemas/offer-withdraw.json')
const offerAcceptedSchema = require('./schemas/offer-accept.json')
const disputeSchema = require('./schemas/dispute.json')
const resolutionSchema = require('./schemas/resolution.json')
const profileSchema = require('./schemas/profile.json')
const reviewSchema = require('./schemas/review.json')

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

function validate(schemaId, data) {
  const validator = ajv.getSchema(schemaId)
  if (!validator) {
    throw new Error(`Failed loading schema validator for ${schemaId}`)
  }
  if (!validator(data)) {
    throw new Error(ajv.errorsText(validator.errors))
  }
}

module.exports = validate
