const fs = require('fs')
const crypto = require('crypto')
const dotenv = require('dotenv')
const { promisify } = require('bluebird')
const { Shop } = require('../data/db')

const readFileAsync = promisify(fs.readFile)

const { ENCRYPTION_KEY } = process.env
const ENCRYPTION_KEY_HASH = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
const CYPHER_ALGO = 'aes256'
const IV_LENGTH = 16

const loadedConfigs = {}
const loadedIVs = {}

/**
 * Get already loaded initialization vector or create one
 *
 * @param {number} storeId
 * @returns {Buffer}
 */
function getIV(storeId) {
  let iv
  if (typeof loadedIVs[storeId] === 'undefined') {
    iv = crypto.randomBytes(IV_LENGTH)
  }
  // only store it if we've been given an ID
  if (storeId) loadedIVs[storeId] = iv
  return iv
}

/**
 * Encrypt a string using the provided iv and system wide encryption key
 *
 * @param {Buffer} iv - initialization vector to use with encryption
 * @param {string} str - string to encrypt
 * @returns {string} - encrypted data
 */
function encrypt(iv, str) {
  const msg = []

  const cypher = crypto.createCipheriv(CYPHER_ALGO, ENCRYPTION_KEY_HASH, iv)

  msg.push(cypher.update(str, 'binary', 'hex'))
  msg.push(cypher.final('hex'))

  return msg.join('')
}

/**
 * Encrypt a JS object using the provided iv and system wide encryption key
 *
 * @param {Buffer} iv - initialization vector to use with encryption
 * @param {string} obj - js object to encrypt
 * @returns {string} - encrypted data
 */
function encryptJSON(iv, obj) {
  return encrypt(iv, JSON.stringify(obj))
}

/**
 * Decrypt a string using the provided iv and system wide encryption key
 *
 * @param {Buffer} iv - initialization vector to use with encryption
 * @param {string} enc - encrypted string to decrypt
 * @returns {string} - decrypted data
 */
function decrypt(iv, enc) {
  const msg = []

  const decypher = crypto.createDecipheriv('aes256', ENCRYPTION_KEY_HASH, iv)

  msg.push(decypher.update(enc, 'hex', 'binary'))
  msg.push(decypher.final('binary'))

  return msg.join('')
}

/**
 * Decrypt a JS object using the provided iv and system wide encryption key
 *
 * @param {Buffer} iv - initialization vector to use with encryption
 * @param {string} enc - encrypted string to decrypt into an object
 * @returns {string} - decrypted object
 */
function decryptJSON(iv, enc) {
  return JSON.parse(decrypt(iv, enc))
}

/**
 * Create a Store record in the DB with provided name and config
 *
 * @param {string} name - store name
 * @param {Object} configObj - config object to store
 * @returns {Object} - Store model instance
 */
async function create(name, configObj) {
  const iv = getIV()
  const encryptedConf = encryptJSON(iv, configObj)
  const record = await Shop.create({
    name,
    config: [iv, encryptedConf].join(':')
  })
  if (!record.id) throw new Error('Store does not have an id, something failed!')

  const storeId = record.id
  loadedConfigs[storeId] = configObj
  loadedIVs[storeId] = iv

  return record
}

/**
 * Save a Store record in the DB
 *
 * @param {number} storeId - store ID
 * @returns {Object} - Store model instance
 */
async function save(storeId) {
  const record = await Shop.findOne({ where: { store_id: storeId } })
  if (!record) throw new Error('Store does not exist')

  // Skip if we don't have any config
  if (typeof loadedConfigs[storeId] === 'undefined') return record
  if (typeof loadedIVs[storeId] === 'undefined') throw new Error('Missing initialization vector?')

  record.config = [
    loadedIVs[storeId],
    encryptJSON(loadedIVs[storeId], loadedConfigs[storeId])
  ].join(':')

  await record.save({ fields: ['config'] })

  return record
}

/**
 * Load a Store record from the DB
 *
 * @param {number} storeId - store ID
 * @param {boolean} force - bypass cache if there's a cached Store
 * @returns {Object} - Store model instance
 */
async function load(storeId, force = false) {
  const record = await Shop.findOne({ where: { store_id: storeId } })
  if (!force && typeof loadedConfigs[storeId] !== 'undefined') return record
  if (!record.config) {
    loadedConfigs[storeId] = {}
    return null
  }
  
  const [iv, encryptedConf] = record.config.split(':')
  loadedIVs[storeId] = iv
  loadedConfigs[storeId] = decryptJSON(storeId, encryptedConf)
  
  return record
}

/**
 * Load and save a Store config from a dotenv configuration
 *
 * @param {number} storeId - store ID
 * @param {string} filename - full path to dotenv file
 * @returns {Object} - Store model instance
 */
async function loadFromEnv(storeId, filename) {
  const rawConfig = dotenv.parse(await readFileAsync(filename))

  for (const k in rawConfig) {
    // TODO: toLowerCase right here?
    loadedConfigs[storeId][k.toLowerCase()] = rawConfig[k]
  }

  return await save(storeId)
}

/**
 * Create a Store record and config from a dotenv configuration
 *
 * @param {number} storeId - store ID
 * @param {string} filename - full path to dotenv file
 * @returns {Object} - Store model instance
 */
async function createFromEnv(storeName, filename) {
  const rawConfig = dotenv.parse(await readFileAsync(filename))
  const config = {}

  for (const k in rawConfig) {
    // TODO: toLowerCase right here?
    config[k.toLowerCase()] = rawConfig[k]
  }

  const record = await create(storeName, config)

  loadedConfigs[record.id] = config

  return record
}

/**
 * Set a config value for a store
 *
 * @param {number} storeId - store ID
 * @param {string} key - configuration key
 * @param {T} val - value to set the config key to
 * @param {boolean} autosave - whether or not to persist the config
 */
async function set(storeId, key, val, autosave = true) {
  await load(storeId)
  loadedConfigs[storeId][key] = val
  if (autosave) await save(storeId)
}

/**
 * Get a config value for a store
 *
 * @param {number} storeId - store ID
 * @param {string} key - configuration key
 * @returns {T} value set to the configuration key
 */
async function get(storeId, key) {
  await load(storeId)
  return loadedConfigs[storeId][key]
}

/**
 * Dump an entire config for a store
 *
 * @param {number} storeId - store ID
 * @returns {Object} store config
 */
async function dump(storeId) {
  await load(storeId)
  return loadedConfigs[storeId]
}

module.exports = {
  encrypt,
  encryptJSON,
  decrypt,
  decryptJSON,
  save,
  load,
  loadFromEnv,
  createFromEnv,
  set,
  get,
  dump
}
