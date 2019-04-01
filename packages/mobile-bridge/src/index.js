'use strict'

import ZeroClientProvider from 'web3-provider-engine/zero'

import initBridge from './webviewbridge'

export default class MobileBridge {
  constructor(web3) {
    this.web3 = web3

    if (window) {
      initBridge()
    }
  }

  processTransaction(transaction, callback) {
    transaction.gasLimit = transaction.gas
  }

  getProvider() {
    const provider = ZeroClientProvider({
      PROVIDER_URL,
      getAccounts: this.getAccounts.bind(this),
      processTransaction: this.processTransaction.bind(this)
    })

    // Disable caching subProviders, because they interfere with the provider
    // we're returning.
    provider._providers.splice(3, 1)
    provider._providers.splice(4, 1)
    provider.isOrigin = true
    return provider
  }
}
