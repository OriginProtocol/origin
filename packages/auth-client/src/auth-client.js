'use strict'

import get from 'lodash/get'

import createDebug from 'debug'

import stringify from 'json-stable-stringify'

const debug = createDebug('origin:auth-client:')

/**
 * Abstracts the auth token management logic
 *
 * Params accepted by constructor:
 * @param {String}  authServer Auth server host URL
 * @param {Boolean} disablePersistence Should store and retrieve tokens from localStorage if set to true.
 * @param {Object}  web3 Web3 instance to be used to sign data
 * @param {Object}  personalSign uses `web3.eth.personal.sign` if true.
 *
 * Usage:
 * 1. Stateless mode with no persistence
 * ```
 * const authClient = new AuthCleint({ ... })
 * const signature = await web3.eth.sign(payload, address)
 * const { authToken, expiresAt } = await authClient.getTokenWithSignature(address, signature, payload)
 * ```
 */
class AuthClient {
  constructor({ authServer, disablePersistence, web3, personalSign }) {
    this.authServer = authServer
    this.disablePersistence = disablePersistence
    this.web3 = web3
    this.personalSign = personalSign

    this.renewalPromise = null
  }

  setWeb3(web3) {
    this.web3 = web3
  }

  /**
   * Generates a token using the signature provided as a param
   *
   * @param {String} wallet Wallet address
   * @param {String} signature Signature Hex
   * @param {any} data Payload that was signed
   * @returns {Boolean} result.success = true if token generated successfully.
   * @returns {String} result.authToken = The authToken to be used for authorization
   * @returns {Number} result.expiresAt = Timestamp of token expiration date
   * @returns {Number} result.issuedAt = Timestamp of token issued date
   */
  async getTokenWithSignature(wallet, signature, data) {
    let url = new URL(this.authServer)
    url.pathname = '/api/tokens'
    url = url.toString()

    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: wallet,
        signature,
        payload: data
      })
    })

    const response = await rawResponse.json()

    if (rawResponse.status !== 201 || !response.success) {
      throw new Error(get(response, 'errors[0]', 'Something went wrong'))
    }

    return response
  }

  /**
   * Requests the user to sign a payload and exchanges
   * the signature with auth-server to get a token
   *
   * @param {String} wallet Wallet address
   * @param {String} message? [Optional] Message to show the user to sign
   *
   * @returns {Boolean} true if successful; false otherwise
   */
  async login(wallet, message) {
    if (this.disablePersistence) {
      debug('Cannot login with persistnce disabled')
      throw new Error('Cannot login with persistnce disabled')
    }

    const payload = {
      message: message || 'I intend to sign in to Origin Marketplace',
      timestamp: Date.now()
    }

    let signature

    // Generate sign
    try {
      const sign = this.personalSign
        ? this.web3.eth.personal.sign
        : this.web3.eth.sign
      signature = await sign(stringify(payload), wallet)
    } catch (err) {
      console.error(err)
      debug('Failed to login', err)

      throw new Error('Signature is needed to login')
    }

    // Get auth token and persist it
    return this.loginWithSign(wallet, signature, payload)
  }

  /**
   * Gets auth token for the `wallet` using `signature`
   * and stores that to localStorage
   *
   * @param {String} wallet Wallet address
   * @param {String} signature Signature Hex
   * @param {any} payload Payload that was signed
   *
   * @returns {Boolean} true if successful
   */
  async loginWithSign(wallet, signature, payload) {
    if (this.disablePersistence) {
      debug('Cannot login with persistnce disabled')
      throw new Error('Cannot login with persistnce disabled')
    }

    try {
      const tokenData = await this.getTokenWithSignature(
        wallet,
        signature,
        payload
      )

      // Persist to localStorage
      this._cacheToken(wallet, tokenData)

      // TODO: Fire onLogin Event

      debug('Login successful')

      return true
    } catch (err) {
      console.error(err)
      debug('Failed to login', err)
      throw new Error('Failed to generate auth token')
    }
  }

  /**
   * Removes token from localStorage and sets nothing
   *
   * @param {String} wallet Wallet address
   */
  logout(wallet) {
    debug('Log out')
    if (this.disablePersistence) {
      debug('Cannot logout with persistnce disabled')
      // Nothing to do in this case
      return true
    }

    // In case of a log out, just forget that such a token exists
    this._removeCache(wallet)

    debug('Logout successful')

    // TODO: Fire onLogout Event

    return true
  }

  /**
   * Check if user has a token in localStorage
   * and load if it is valid
   *
   * @param {String} wallet Wallet address
   *
   * @returns {{
   *  valid
   *  expired
   *  willExpire
   * }}
   */
  loadToken(wallet) {
    if (!wallet) {
      debug('No active wallet, clearing token data')
      return null
    }

    // Try to load any tokens
    const tokenData = this._loadCachedToken(wallet)

    debug(`Loaded token data for ${wallet}: ${!!tokenData}`)

    return tokenData
  }

  /**
   * Check if token is valid
   *
   * @param {Object} tokenData
   *
   * @returns {{
   *  valid
   *  expired
   *  willExpire
   * }}
   */
  checkTokenValidity(tokenData) {
    if (!tokenData) {
      return {
        valid: false
      }
    }

    const { expiresAt } = tokenData
    const now = Date.now()

    const diff = expiresAt - now

    debug(`Token expires in ${expiresAt} and that is ${diff}ms from now`)

    let willExpire = false

    if (diff <= 5000) {
      // If the token has expired or has less than
      // 5 seconds of validity left, consider it expired

      // TODO: fire OnTokenExpired
      return {
        valid: false,
        expired: true
      }
    } else if (diff <= 24 * 60 * 60 * 1000) {
      // If the token is about to expire in the next 24 hours,
      // Notify the user

      // TODO: fire OnTokenWillExpire

      willExpire = true
    }

    return {
      valid: true,
      willExpire
    }
  }

  /**
   * A wrapper around `checkTokenValidity` that fetches
   * the token from localStorage and validates it
   *
   * @param {String} wallet
   */
  getWalletTokenStatus(wallet) {
    const tokenData = this.loadToken(wallet)

    return this.checkTokenValidity(tokenData)
  }

  /**
   * @returns {Boolean} true if logged in with valid token; false otherwise
   */
  isLoggedIn(wallet) {
    return this.getWalletTokenStatus(wallet).valid
  }

  getAccessToken(wallet) {
    if (!wallet) {
      return null
    }

    const tokenData = this.loadToken(wallet)

    const { valid, expired, willExpire } = this.checkTokenValidity(tokenData)

    debug('Token status', JSON.stringify({ valid, expired, willExpire }))

    if (!valid) {
      return null
    }

    return tokenData.authToken
  }

  /**
   * Checks if existing auth token is valid and
   * generates a new one if it is not or if it is
   * about to expire.
   *
   * To be used only from mobile
   *
   * @param {String} wallet Wallet address
   * @param {String} signature Signature Hex
   * @param {any} payload Payload that was signed
   */
  async onAuthSign(wallet, signature, payload) {
    const tokenData = this.loadToken(wallet)

    debug('onAuthSign', wallet, payload)

    const { valid, expired, willExpire } = this.checkTokenValidity(tokenData)

    if (!valid || expired || willExpire) {
      // The current token is invalid or will expire soon
      // Generate a new one
      await this.loginWithSign(wallet, signature, payload)
      debug('Generated new auth token for ', wallet)
    } else {
      debug('Existing token is valid. Skipping generation of new token')
    }
  }

  /**
   * Loads token from localStorage if it exists
   *
   * @param {String} wallet
   *
   * @returns {{
   *  authToken
   *  expiredAt
   *  issuedAt
   * }|null} Object if found, null otherwise
   */
  _loadCachedToken(wallet) {
    debug('Loading token from cache for wallet:', wallet)

    const tokenData = window.localStorage.getItem(`auth:${wallet}`)

    return tokenData ? JSON.parse(tokenData) : null
  }

  /**
   * Stores token data to localStorage
   *
   * @param {String} wallet
   * @param {Object} tokenData
   */
  _cacheToken(wallet, tokenData) {
    window.localStorage.setItem(`auth:${wallet}`, JSON.stringify(tokenData))
  }

  /**
   * Clears token cache from localStorage
   *
   * @param {String} wallet
   */
  _removeCache(wallet) {
    window.localStorage.removeItem(`auth:${wallet}`)
  }
}

export default AuthClient
