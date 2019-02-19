import adapterFactory from './adapters/adapter-factory'
import { generateSchemaId, parseSchemaId } from './schema-id'

export const IDENTITY_DATA_TYPE = 'identity'
export const LISTING_DATA_TYPE = 'listing'
export const LISTING_WITHDRAW_DATA_TYPE = 'listing-withdraw'
export const OFFER_DATA_TYPE = 'offer'
export const OFFER_WITHDRAW_DATA_TYPE = 'offer-withdraw'
export const OFFER_ACCEPT_DATA_TYPE = 'offer-accept'
export const DISPUTE_DATA_TYPE = 'dispute'
export const RESOLUTION_DATA_TYPE = 'resolution'
export const PROFILE_DATA_TYPE = 'profile'
export const REVIEW_DATA_TYPE = 'review'

const DATA_TYPES = [
  IDENTITY_DATA_TYPE,
  LISTING_DATA_TYPE,
  LISTING_WITHDRAW_DATA_TYPE,
  OFFER_DATA_TYPE,
  OFFER_WITHDRAW_DATA_TYPE,
  OFFER_ACCEPT_DATA_TYPE,
  DISPUTE_DATA_TYPE,
  RESOLUTION_DATA_TYPE,
  REVIEW_DATA_TYPE,
  PROFILE_DATA_TYPE
]

//
// JSON data store backed by IPFS.
//
export class IpfsDataStore {
  /**
   *
   * @param {IpfsService} ipfsService - IPFS service to use.
   */
  constructor(ipfsService) {
    this.ipfsService = ipfsService
  }

  /**
   * Loads and validates data from IPFS.
   * @param {string} expectedDataType - Type of object to load.
   * @param {string} ipfsHash - Base58 encoded IPFS hash.
   * @returns {object} data
   * @throws {Error}
   */
  async load(expectedDataType, ipfsHash) {
    if (!DATA_TYPES.includes(expectedDataType)) {
      throw new Error(`Unsupported data type: ${dataType}`)
    }

    // Fetch the data from storage.
    const ipfsData = await this.ipfsService.loadObjFromFile(ipfsHash)

    // Extract type and version from schemaID of the data, then check it matches expected type.
    if (!ipfsData.schemaId) {
      throw new Error(`Data missing schemaId: ${JSON.stringify(ipfsData)}`)
    }
    const { dataType, schemaVersion } = parseSchemaId(ipfsData.schemaId)
    if (dataType !== expectedDataType) {
      throw new Error(`Expected ${expectedDataType} vs ${dataType} for IPFS Hash ${ipfsHash}`)
    }

    // Get an adapter to handle the data.
    const adapter = adapterFactory(ipfsData.schemaId, dataType, schemaVersion)

    // Decode and validate the data.
    const data = adapter.decode(ipfsData)

    // Apply any post-processing after loading data.
    if (adapter.postProcessor) adapter.postProcessor(data, this.ipfsService)

    // Add the IPFS hash and raw data to the object.
    data.ipfs = {
      hash: ipfsHash,
      data: ipfsData
    }

    return data
  }
  
  async processData(dataType, ipfsData) {
    if (!DATA_TYPES.includes(dataType)) {
      throw new Error(`Unsupported data type: ${dataType}`)
    }

    const { schemaId, schemaVersion } = generateSchemaId(dataType)
    ipfsData.schemaId = schemaId

    // Get an adapter to handle the data.
    const adapter = adapterFactory(ipfsData.schemaId, dataType, schemaVersion)

    // Decode and validate the data.
    const data = adapter.decode(ipfsData)

    // Apply any post-processing after loading data.
    if (adapter.postProcessor) adapter.postProcessor(data, this.ipfsService)

    return data
  }

  async encodeData(dataType, data) {
    if (!DATA_TYPES.includes(dataType)) {
      throw new Error(`Unsupported data type: ${dataType}`)
    }

    // Get latest version of the schemaID to use for the data type.
    // Set that schemaID in the data.
    const { schemaId, schemaVersion } = generateSchemaId(dataType)
    data.schemaId = schemaId

    // Get an adapter to handle the data.
    const adapter = adapterFactory(schemaId, dataType, schemaVersion)

    // Apply any pre-processing before storing data.
    if (adapter.preProcessor) await adapter.preProcessor(data, this.ipfsService)

    // Validate and encode the input data.
    return adapter.encode(data)
  }


  /**
   * Validates and saves data to IPFS.
   * @param {string} dataType - Type of object to store.
   * @param {object} data - Object compliant with Origin Protocol schema.
   * @returns {bytes} Base58 encoded IPFS Hash.
   * @throws {Error}
   */
  async save(dataType, data) {
    // Validate and encode the input data.
    const ipfsData = await this.encodeData(dataType, data)

    // Write data to storage.
    const ipfsHash = await this.ipfsService.saveObjAsFile(ipfsData)
    return ipfsHash
  }
}
