import Ajv from 'ajv'

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

export default class AdapterBase {
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
