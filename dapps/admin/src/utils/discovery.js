import { getDiscovery } from './config'

/**
 * Utilities for querying, and authenticating with, the discovery server.
 */

// Used for localStorage
const TOKEN_STORAGE_KEY = 'discoveryAuthToken'

/**
 * Send a query to the discovery server.
 * @param {*} query
 * @param {*} variables
 * @returns {Promise<*>} Results of query
 */
export function query(query, variables) {
  const authToken = activeAuthToken()
  return new Promise(function(resolve, reject) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
    if (authToken) {
      headers['x-discovery-auth-token'] = authToken
    }
    fetch(getDiscovery(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: query, variables: variables })
    })
      .then(r => r.json())
      .then(data => {
        if (data.errors && data.errors[0]) {
          if (
            data.errors[0].message.indexOf('You are not logged in') !== -1 ||
            data.errors[0].message.indexOf('You must be a moderator') !== -1
          ) {
            clearAccessToken()
          }
        }
        resolve(data)
      })
      .catch(error => reject(error))
  })
}

/**
 * Active, non-expired auth token, or undefined.
 * @returns {string}
 */
export function activeAuthToken() {
  if (timeRemaining() < 0) {
    return undefined
  }
  try {
    const { authToken } = JSON.parse(
      window.localStorage[TOKEN_STORAGE_KEY] || '{}'
    )
    return authToken
  } catch (e) {
    return undefined
  }
}

/**
 * Store an access token in LocalStorage
 * @param {*} access
 */
export function persistAccessToken(access) {
  const { authToken, expires, ethAddress } = access
  if (!authToken) {
    clearAccessToken()
    return
  }
  window.localStorage[TOKEN_STORAGE_KEY] = JSON.stringify({
    authToken,
    expires,
    ethAddress
  })
}

export function clearAccessToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * How much time to we have left until the active access token expires
 * @returns {int} time to expiration, in thousandsths of a second.
 */
export function timeRemaining() {
  try {
    const { expires } = JSON.parse(
      window.localStorage[TOKEN_STORAGE_KEY] || '{}'
    )
    if (expires == undefined) {
      return -1
    }
    const now = new Date().getTime()
    return expires - now
  } catch (e) {
    console.error(e)
    return false
  }
}
