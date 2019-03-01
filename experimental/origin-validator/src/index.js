const Ajv = require('ajv')

const attestationSchema = require('./schemas/attestation_1.0.0.json')
const disputeSchema = require('./schemas/dispute.json')
const identitySchema = require('./schemas/identity_1.0.0.json')
const listingSchema = require('./schemas/listing.json')
const listingWithdrawnSchema = require('./schemas/listing-withdraw.json')
const offerAcceptedSchema = require('./schemas/offer-accept.json')
const offerSchema = require('./schemas/offer.json')
const offerWithdrawnSchema = require('./schemas/offer-withdraw.json')
const profileSchema = require('./schemas/profile_2.0.0.json')
const resolutionSchema = require('./schemas/resolution.json')
const reviewSchema = require('./schemas/review.json')

const ajv = new Ajv({ allErrors: true })
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
ajv.addSchema([
  attestationSchema,
  disputeSchema,
  identitySchema,
  listingSchema,
  listingWithdrawnSchema,
  offerAcceptedSchema,
  offerSchema,
  offerWithdrawnSchema,
  profileSchema,
  resolutionSchema,
  reviewSchema
])

const BASE_SCHEMA_ID = 'https://schema.originprotocol.com/'

// Regex for extracting data type and version from schemaId.
// eslint-disable-next-line no-useless-escape
const schemaIdRegex = new RegExp(
  '^/([a-zA-Z\\-]*)_v?(\\d+\\.\\d+\\.\\d+)(?:\\.json)?$'
)

function parseSchemaId(schemaId) {
  const url = new URL(schemaId)
  const splits = schemaIdRegex.exec(url.pathname)
  if (!splits) {
    throw new Error(`Invalid schemaId: ${schemaId}`)
  }
  return { dataType: splits[1], schemaVersion: splits[2] }
}

function validate(schemaId, data) {
  const { dataType, schemaVersion } = parseSchemaId(schemaId)
  const normalizedSchemaId = `${BASE_SCHEMA_ID}${dataType}_${schemaVersion}.json`
  const validator = ajv.getSchema(normalizedSchemaId)
  if (!validator) {
    throw new Error(`Failed loading schema validator for ${schemaId}`)
  }
  if (!validator(data)) {
    throw new Error(ajv.errorsText(validator.errors))
  }
}

module.exports = validate
