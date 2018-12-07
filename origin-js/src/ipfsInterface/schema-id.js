/*
  Utilities for manipulating schemaIds.

  Format of a schema ID is BASE_SCHEMA_ID/<dataType>_<version>.json
  Ex.: https://schema.originprotocol.com/listing_1.0.0.json
 */

export const BASE_SCHEMA_ID = 'https://schema.originprotocol.com/'

// Regex for extracting data type and version from schemaId.
// eslint-disable-next-line no-useless-escape
const schemaIdRegex = new RegExp('^/([a-zA-Z\\-]*)_v?(\\d+\\.\\d+\\.\\d+)(?:\\.json)?$')

/**
 * Generates a schemaId for a dataType using the most recent version.
 * @param {string} dataType
 * @return {schemaId: string, version: string}
 */
function generateSchemaId(dataType) {
  // TODO: should lookup in a config to get most recent version to use.
  const schemaVersion = '1.0.0'
  const schemaId = `${BASE_SCHEMA_ID}${dataType}_${schemaVersion}.json`
  return { schemaId, schemaVersion }
}

/**
 * Extracts dataType and version from a schemaId.
 * @param (string} schemaId
 * @return {{dataType: string, version: string}}
 */
function parseSchemaId(schemaId) {
  const url = new URL(schemaId)
  const splits = schemaIdRegex.exec(url.pathname)
  if (!splits) {
    throw new Error(`Invalid schemaId: ${schemaId}`)
  }
  return { dataType: splits[1], schemaVersion: splits[2] }
}



module.exports = { generateSchemaId, parseSchemaId }