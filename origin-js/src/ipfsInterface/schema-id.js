/*
  Utilities for manipulating schemaIds.

  Format of a schema ID is BASE_SCHEMA_ID/<dataType>_<version>.json
  Ex.: https://schema.originprotocol.com/listing_1.0.0.json
 */

const BASE_SCHEMA_ID = 'https://schema.originprotocol.com/'

// Regex for extracting data type and version from schemaId.
// eslint-disable-next-line no-useless-escape
const schemaIdRegex = new RegExp('^/([a-zA-Z\\-]*)_v?(\\d+\\.\\d+\\.\\d+)(?:\\.json)?$')

/**
 * Generates a schemaId for a dataType using the most recent version.
 * @param {string} dataType
 * @param {string} version - if null uses latest version.
 * @return {{schemaId: string, schemaVersion: string}}
 */
function generateSchemaId(dataType, schemaVersion=null) {
  // TODO: should lookup in a config to get most recent version to use.
  schemaVersion = schemaVersion ? schemaVersion : '1.0.0'
  const schemaId = `${BASE_SCHEMA_ID}${dataType}_${schemaVersion}.json`
  return { schemaId, schemaVersion }
}

/**
 * Extracts dataType and version from a schemaId.
 * @param {string} schemaId
 * @return {{dataType: string, schemaVersion: string}}
 */
function parseSchemaId(schemaId) {
  const url = new URL(schemaId)
  const splits = schemaIdRegex.exec(url.pathname)
  if (!splits) {
    throw new Error(`Invalid schemaId: ${schemaId}`)
  }
  return { dataType: splits[1], schemaVersion: splits[2] }
}

module.exports = { BASE_SCHEMA_ID, generateSchemaId, parseSchemaId }
