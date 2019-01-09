import AdapterBase from '../adapter-base'
import { parseSchemaId } from '../../schema-id'

export default class IdentityAdapterV1 extends AdapterBase {
  /**
   * Validate Identity data.
   * @throws {Error} If validation fails.
   */
  validate(data) {
    //
    // Step 1: validate the identity wrapper.
    //
    const { dataType, schemaVersion } = parseSchemaId(data.schemaId)
    if (dataType !== this.dataType || schemaVersion !== this.schemaVersion) {
      throw new Error(
        `Adapter ${this.dataType} ${this.schemaVersion} can not process ${data.schemaId}`
      )
    }

    let schemaId = data.schemaId
    let validator = this.ajv.getSchema(schemaId)
    if (!validator) {
      throw new Error(`Failed loading identity schema with id ${schemaId}`)
    }
    if (!validator(data)) {
      throw new Error(
        `Identity failed schema validation.
        Schema id: ${schemaId}
        Data: ${JSON.stringify(data)}.
        Errors: ${JSON.stringify(validator.errors)}`
      )
    }

    //
    // Step 2: validate profile.
    //
    const profile = data.profile
    schemaId = profile.schemaId
    validator = this.ajv.getSchema(schemaId)
    if (!validator) {
      throw new Error(`Failed loading profile schema with id ${schemaId}`)
    }
    if (!validator(profile)) {
      throw new Error(
        `Profile failed schema validation.
        Schema id: ${schemaId}
        Data: ${JSON.stringify(profile)}
        Errors: ${JSON.stringify(validator.errors)}`
      )
    }

    //
    // Step 3: validate each attestation.
    //
    const attestations = data.attestations
    attestations.forEach(attestation => {
      schemaId = attestation.schemaId
      validator = this.ajv.getSchema(schemaId)
      if (!validator) {
        throw new Error(`Failed loading attestation schema with id ${schemaId}`)
      }
      if (!validator(attestation)) {
        throw new Error(
          `Attestation failed schema validation.
          Schema id: ${schemaId}
          Data: ${JSON.stringify(attestation)}
          Errors: ${JSON.stringify(validator.errors)}`
        )
      }
    })
  }
}