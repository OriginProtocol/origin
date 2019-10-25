'use strict'

import Cookies from 'js-cookie'

import createDebug from 'debug'

const debug = createDebug('origin:auth-client:')

function loadTokenCookie(walletAddress) {
  const key = 'authtoken:' + walletAddress
  const tokenData = Cookies.getJSON(key)

  debug('Found token data in cookies', key, tokenData)

  return tokenData
}

function saveTokenCookie(walletAddress, tokenData) {
  const key = 'authtoken:' + walletAddress
  debug('Saving token data to cookies', key, tokenData)
  Cookies.set(key, tokenData, {
    // Cookies should expire in 30 days
    expires: 30
  })
}

function removeTokenCookie(walletAddress) {
  const key = 'authtoken:' + walletAddress
  debug('Removing token data from ', key)
  Cookies.remove(key)
}

export {
  loadTokenCookie,
  saveTokenCookie,
  removeTokenCookie
}
