
const crypto = require('crypto')

/**
 * Encrypt
 * @param {string} str - String to encrypt, UTF-8 encoded.
 * @returns {string} - Encrypted string, hex encoded.
 */
function encrypt(str) {
  const cipher = crypto.createCipher('aes-128-cbc', 'mypassword')
  cipher.update(str, 'utf8', 'hex')
  return cipher.final('hex')
}

/**
 * Decrypt
 * @param str - Encrypted string, hex encoded.
 * @returns {string} - Decrypted string, UTF-8 encoded.
 */
function decrypt(str) {
  const decipher = crypto.createDecipher('aes-128-cbc', 'mypassword')
  decipher.update(str, 'hex', 'utf8')
  return decipher.final('utf8')
}

module.exports = { encrypt, decrypt }