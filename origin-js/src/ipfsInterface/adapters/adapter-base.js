import Ajv from 'ajv'

import { generateSchemaId, parseSchemaId } from '../schema-id'

import attestationSchema from '../schemas/attestation_1.0.0.json'
import identitySchemaV1 from '../schemas/identity_1.0.0'
import listingSchemaV1 from '../schemas/listing_1.0.0.json'
import listingWithdrawnSchemaV1 from '../schemas/listing-withdraw_1.0.0.json'
import offerSchemaV1 from '../schemas/offer_1.0.0.json'
import offerWithdrawnSchemaV1 from '../schemas/offer-withdraw_1.0.0.json'
import offerAcceptedSchemaV1 from '../schemas/offer-accept_1.0.0.json'
import disputeSchemaV1 from '../schemas/dispute_1.0.0.json'
import resolutionSchemaV1 from '../schemas/resolution_1.0.0.json'
import profileSchemaV1 from '../schemas/profile_1.0.0.json'
import profileSchemaV2 from '../schemas/profile_2.0.0.json'
import reviewSchemaV1 from '../schemas/review_1.0.0.json'

const ajv = new Ajv({ allErrors: true })
// To use the draft-06 JSON schema, we need to explicitly add it to ajv.
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
ajv.addSchema([
  attestationSchema,
  identitySchemaV1,
  listingSchemaV1,
  listingWithdrawnSchemaV1,
  offerSchemaV1,
  offerWithdrawnSchemaV1,
  offerAcceptedSchemaV1,
  disputeSchemaV1,
  resolutionSchemaV1,
  profileSchemaV1,
  profileSchemaV2,
  reviewSchemaV1
])

export default class AdapterBase {
  constructor(dataType, schemaVersion) {
    this.dataType = dataType
    this.schemaVersion = schemaVersion
    this.ajv = ajv
  }

  /**
   * Validates the data is compliant with Origin Protocol schema.
   * @throws {Error} If validation fails.
   */
  validate(data) {
    const { dataType, schemaVersion } = parseSchemaId(data.schemaId)
    if (dataType !== this.dataType || schemaVersion !== this.schemaVersion) {
      throw new Error(
        `Adapter ${this.dataType} ${this.schemaVersion} can not process ${data.schemaId}`
      )
    }

    const { schemaId } = generateSchemaId(dataType, schemaVersion)
    const validator = ajv.getSchema(schemaId)

    if (!validator) {
      throw new Error(`Failed loading schema validator for ${schemaId}`)
    }
    if (!validator(data)) {
      throw new Error(
        `Data failed schema validation.
        Schema id: ${schemaId}
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
