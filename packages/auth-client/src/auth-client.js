'use strict'

import get from 'lodash/get'

import createDebug from 'debug'

import stringify from 'json-stable-stringify'

import {
  loadTokenCookie,
  saveTokenCookie,
  removeTokenCookie
} from './cookie-helpers'

const debug = createDebug('origin:auth-client:')

/**
 * Abstracts the auth token management logic
 *
 * Params accepted by constructor:
 * @param {String}  authServer Auth server host URL
 * @param {Boolean} disablePersistence Should store and retrieve tokens from cookies if set to true.
 * @param {Object}  web3 Web3 instance to be used to sign data
 * @param {Object}  personalSign uses `web3.eth.personal.sign` if true.
 * @param {Object}  autoRenew autoRenews token if it is about to expire
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
  constructor({
    authServer,
    disablePersistence,
    web3,
    personalSign,
    autoRenew
  }) {
    this.authServer = authServer
    this.disablePersistence = disablePersistence
    this.web3 = web3
    this.personalSign = personalSign
    this.autoRenew = autoRenew

    this.renewalPromise = null
  }

  setWeb3(web3) {
    this.web3 = web3
  }

  /**
   * Generates a token using the signature provided as a param
   *
   * @param {String} address Wallet address
   * @param {String} signature Signature Hex
   * @param {any} data Payload that was signed
   * @returns {Boolean} result.success = true if token generated successfully.
   * @returns {String} result.authToken = The authToken to be used for authorization
   * @returns {Number} result.expiresAt = Timestamp of token expiration date
   * @returns {Number} result.issuedAt = Timestamp of token issued date
   */
  async getTokenWithSignature(address, signature, data) {
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
        address: address,
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

    try {
      const sign = this.personalSign
        ? this.web3.eth.personal.sign
        : this.web3.eth.sign
      const signature = await sign(stringify(payload), wallet)

      const tokenData = await this.getTokenWithSignature(
        wallet,
        signature,
        payload
      )

      // Persist to cookies
      saveTokenCookie(wallet, tokenData)

      // TODO: Fire onLogin Event

      debug('Login successful')

      return true
    } catch (err) {
      console.error(err)
      debug('Failed to login', err)
    }

    return false
  }

  /**
   * Removes token from cookies and sets nothing
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

    // In case of a log out, just forget that such a cookie exists
    removeTokenCookie(wallet)

    debug('Logout successful')

    // TODO: Fire onLogout Event

    return true
  }

  /**
   * Check if user has a token in cookies
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
    const tokenData = loadTokenCookie(wallet)

    debug(`Loaded token data for ${wallet}: ${!!tokenData}`)

    return tokenData
  }

  /**
   * Check if token is valid
   *
   * @param {Object} tokenData
   * @param {String} wallet
   *
   * @returns {{
   *  valid
   *  expired
   *  willExpire
   * }}
   */
  checkTokenValidity(tokenData, wallet) {
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

      // Renew in background
      if (this.autoRenew && !this.renewalPromise) {
        this.renewalPromise = this.login(wallet)
          .catch(err => {
            console.err('Failed to renew token in background', err)
          })
          .then(() => {
            this.renewalPromise = null
          })
      }

      willExpire = true
    }

    return {
      valid: true,
      willExpire
    }
  }

  /**
   * A wrapper around `checkTokenValidity` that fetches
   * the token from cookies and validates it
   *
   * @param {String} wallet
   */
  getWalletTokenStatus(wallet) {
    const tokenData = this.loadToken(wallet)

    return this.checkTokenValidity(tokenData, wallet)
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

    const { valid, expired, willExpire } = this.checkTokenValidity(
      tokenData,
      wallet
    )

    debug('Token status', JSON.stringify({ valid, expired, willExpire }))

    // if (valid && willExpire) {
    //   // TODO
    //   // Load a new token in the background, for mobile
    // }

    if (!valid) {
      return null
    }

    return tokenData.authToken
  }
}

export default AuthClient
