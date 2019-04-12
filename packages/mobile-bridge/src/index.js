'use strict'

import ZeroClientProvider from 'web3-provider-engine/zero'

import initBridge from './webviewbridge'

class MobileBridge {
  constructor({ web3 }) {
    this.web3 = web3

    if (window) {
      initBridge()
    }
  }

  processTransaction(transaction, callback) {
    transaction.gasLimit = transaction.gas
    let onSuccess, onError
    if (callback) {
      onSuccess = (result) => {
        callback(undefined, result)
      }
      onError = (result) => {
        callback(undefined, result)
      }
    } else {
      onSuccess = (result) => {
        return new Promise(resolve => resolve(result))
      }
      onError = (result) => {
        return new Promise((resolve, reject) => reject(result))
      }
    }
    window.webViewBridge.send('processTransaction', transaction, onSuccess, onError)
  }

  getAccounts(callback) {
    const data = null
    let onSuccess
    if (callback) {
      onSuccess = (result) => {
        callback(undefined, result)
      }
    } else {
      onSuccess = (result) => {
        return new Promise(resolve => resolve(result))
      }
    }
    window.webViewBridge.send('getAccounts', data, onSuccess)
  }

  getProvider() {
    const rpcUrl = this.web3.eth.net.currentProvider.host

    const provider = ZeroClientProvider({
      rpcUrl,
      getAccounts: this.getAccounts.bind(this),
      processTransaction: this.processTransaction.bind(this)
    })

      /*
    // Disable transaction validation, which interferes with our work.
    const hookedWallet = provider._providers[6]
    if (!hookedWallet.validateTransaction) {
      console.error('The subprovider at [6] is NOT a hooked wallet.')
    } else {
      // Pass through validate for now
      hookedWallet.validateTransaction = (_, cb) => {
        cb()
      }
    }
    */

    // Disable caching subProviders, because they interfere with the provider
    // we're returning.
    provider._providers.splice(3, 1)
    provider._providers.splice(4, 1)
    provider.isOrigin = true

    return provider
  }
}

export default function MobileBridgeFunc(opts) {
  return new MobileBridge(opts)
}
