'use strict'

import Cookies from 'js-cookie'

import createDebug from 'debug'

const debug = createDebug('origin:auth-client:')

/**
 * Returns token data from cookies if it exists
 * @param {String} walletAddress
 * @returns {{
 *  address: String
 *  expiresAt: String
 *  issuedAt: String
 * }}
 */
function loadTokenCookie(walletAddress) {
  const key = 'authtoken:' + walletAddress
  const tokenData = Cookies.get(key)

  if (tokenData) {
    debug('Found token data in cookies', key, tokenData)
    return JSON.parse(tokenData)
  }

  return null
}

/**
 * Stores the token to cookies
 * 
 * @param {String} walletAddress
 * @param {{
 *  authToken: String
 *  expiresAt: String
 *  issuedAt: String
 * }} tokenData
 */
function saveTokenCookie(walletAddress, tokenData) {
  const key = 'authtoken:' + walletAddress
  debug('Saving token data to cookies', key, tokenData)
  Cookies.set(key, tokenData, {
    // Set expiration time relative to `tokenData.expiresAt`
    expires: Math.floor((tokenData.expiresAt - tokenData.issuedAt) / (1000 * 60 * 60 * 24)), // ms to days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: ''
  })
}

/**
 * Removes token from cookies if it exists
 * @param {String} walletAddress
 */
function removeTokenCookie(walletAddress) {
  const key = 'authtoken:' + walletAddress
  debug('Removing token data from ', key)
  Cookies.remove(key, {
    path: ''
  })
}

export { loadTokenCookie, saveTokenCookie, removeTokenCookie }
