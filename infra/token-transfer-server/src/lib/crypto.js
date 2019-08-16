const crypto = require('crypto')

const { encryptionSecret } = require('../config')

/**
 * Encrypt
 * @param {string} str - String to encrypt, UTF-8 encoded.
 * @returns {string} - Encrypted string, hex encoded.
 */
function encrypt(str) {
  const key = crypto.scryptSync(encryptionSecret, 'salt', 24)
  const iv = Buffer.alloc(16, 0) // TODO: use a random iv
  const cipher = crypto.createCipheriv('aes-192-cbc', key, iv)
  let encrypted = cipher.update(str, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

/**
 * Decrypt
 * @param str - Encrypted string, hex encoded.
 * @returns {string} - Decrypted string, UTF-8 encoded.
 */
function decrypt(str) {
  const key = crypto.scryptSync(encryptionSecret, 'salt', 24)
  const iv = Buffer.alloc(16, 0) // TODO: use a random iv
  const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv)
  let decrypted = decipher.update(str, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

module.exports = { encrypt, decrypt }
