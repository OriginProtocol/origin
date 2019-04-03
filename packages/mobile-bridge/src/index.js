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
    console.log('Process transaction')
    transaction.gasLimit = transaction.gas
  }

  getAccounts() {
    console.log('Called get accounts')
    const accounts = Object.keys(this.web3.eth.accounts.wallet).filter(k => {
      return web3.utils.isAddress(k) && k === web3.utils.toChecksumAddress(k)
    })
    return accounts
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
    console.log('Returning provider')
    return provider
  }
}

export default function MobileBridgeFunc(opts) {
  return new MobileBridge(opts)
}
