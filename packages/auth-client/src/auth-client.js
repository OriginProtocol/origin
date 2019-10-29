'use strict'

import { removeTokenCookie } from './cookie-helpers'

import get from 'lodash/get'

import createDebug from 'debug'

const debug = createDebug('origin:auth-client:')

class AuthClient {
  constructor({ authServer, activeWallet, disablePersistence }) {
    this.authServer = authServer
    this.disablePersistence = disablePersistence

    this.setActiveWallet(activeWallet)

    if (!disablePersistence) {
      // Load token from cookies
      this.loadLocalToken()
    }
  }

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

  logOut() {
    debug('Log out')
    this.setActiveWallet(null)

    if (this.disablePersistence) {
      // Nothing to do in this case
      return
    }

    // In case of a log out, just forget that such a cookie exists
    removeTokenCookie(this.walletAddress)
    return true
  }
}

export default AuthClient
