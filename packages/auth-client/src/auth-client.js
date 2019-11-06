'use strict'

import get from 'lodash/get'

import createDebug from 'debug'

const debug = createDebug('origin:auth-client:')

/**
 * Abstracts the auth token management logic
 *
 * Params accepted by constructor:
 * @param {String} authServer Auth server host URL
 * @param {Address} activeWallet Active wallet's ETH address
 * @param {Boolean} disablePersistence (Yet to be used); Should store and retrieve tokens from cookies if set to true.
 *
 * Usage:
 * 1. Stateless mode with no persistence
 * ```
 * const authClient = new AuthCleint({ ... })
 * const signature = await web3.eth.sign(payload, address)
 * const { authToken, expiresAt } = await authClient.getTokenWithSignature(signature, payload)
 * ```
 */
class AuthClient {
  constructor({ authServer, activeWallet, disablePersistence }) {
    this.authServer = authServer
    this.disablePersistence = disablePersistence

    this.setActiveWallet(activeWallet)
  }

  /**
   * Generates a token using `this.activeWallet` and the signature
   * provided as a param
   * @param {String} signature Signature Hex
   * @param {any} data Payload that was signed
   * @returns {Boolean} result.success = true if token generated successfully.
   * @returns {String} result.authToken = The authToken to be used for authorization
   * @returns {Number} result.expiresAt = Timestamp of token expiration date
   * @returns {Number} result.issuedAt = Timestamp of token issued date
   */
  async getTokenWithSignature(signature, data) {
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
        address: this.activeWallet,
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

  getActiveWallet() {
    return this.activeWallet
  }

  setActiveWallet(walletAddress) {
    debug('Changing active wallet from', this.activeWallet, 'to', walletAddress)
    this.activeWallet = walletAddress
  }

  // TODO: To be used when working for login screen
  // logOut() {
  //   debug('Log out')
  //   this.setActiveWallet(null)

  //   if (this.disablePersistence) {
  //     // Nothing to do in this case
  //     return
  //   }

  //   // In case of a log out, just forget that such a cookie exists
  //   removeTokenCookie(this.walletAddress)
  //   return true
  // }
}

export default AuthClient
