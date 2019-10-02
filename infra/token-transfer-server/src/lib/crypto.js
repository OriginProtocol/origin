const crypto = require('crypto')

const { encryptionSecret } = require('../config')
const key = crypto
  .createHash('sha256')
  .update(encryptionSecret)
  .digest()
const algorithm = 'aes-256-ctr'

/**
 * Encrypt
 * @param {string} str - String to encrypt, UTF-8 encoded.
 * @returns {string} - Encrypted string, hex encoded with iv prefixed.
 */
function encrypt(str) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  const encrypted = cipher.update(str, 'utf8', 'hex') + cipher.final('hex')
  return iv.toString('hex') + encrypted
}

/**
 * Decrypt
 * @param str - Encrypted string, hex encoded with iv prefixed.
 * @returns {string} - Decrypted string, UTF-8 encoded.
 */
function decrypt(str) {
  const iv = Buffer.from(str.slice(0, 32), 'hex')
  const encrypted = str.slice(32)

  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
}

module.exports = { encrypt, decrypt }
