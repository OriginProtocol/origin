'use strict'

import ZeroClientProvider from 'web3-provider-engine/zero'
import EthGasStationProvider from './EthGasStationProvider'

import initBridge from './webviewbridge'

class BlockTracker {
  /**
   * BlockTracker to replace the one used in web3-provider-engine
   * Events:
   * error
   * sync
   * latest (blockNumber)
   */
  constructor({ pubsub }) {
    this._resetHandlers()
    this.latest = 0

    const that = this
    pubsub.ee.on('NEW_BLOCK', ({ newBlock }) => {
      if (typeof newBlock.id === 'number') {
        const blockNum = `0x${newBlock.id.toString(16)}`
        that.latest = blockNum
        this.emit('latest', blockNum)
      } else {
        console.warn('Invalid block number in BlockTracker')
      }
    })
  }

  _resetHandlers() {
    this.handlers = {
      latest: [],
      error: [],
      sync: []
    }
  }

  on(evName, cb) {
    if (typeof this.handlers[evName] === 'undefined') {
      this.handlers[evName] = []
    }
    this.handlers[evName].push(cb)
  }

  emit() {
    const args = Object.values(arguments)
    const evName = args.shift()
    if (typeof this.handlers[evName] !== 'undefined') {
      for (const cb of this.handlers[evName]) {
        if (typeof cb !== 'function') {
          console.warn('callback is not function')
          continue
        }
        cb.apply(null, args)
      }
    }
  }

  removeAllListeners() {
    return this._resetHandlers()
  }

  async getLatestBlock () {
    // return if available
    if (this.latest) return this.latest
    // wait for a new latest block
    this.latest = await new Promise(resolve => this.once('latest', resolve))
    // return newly set current block
    return this.latest
  }

  getCurrentBlock () {
    return this.latest
  }

  isRunning () {
    return true
  }
}

class MobileBridge {
  constructor({ web3, pubsub }) {
    this.web3 = web3
    if (window.ReactNativeWebView) {
      initBridge()
    }
    this.blockTracker = new BlockTracker({ pubsub })
  }

  processTransaction(transaction, callback) {
    transaction.gasLimit = transaction.gas
    let onSuccess, onError
    if (callback) {
      onSuccess = result => {
        callback(undefined, result)
      }
      onError = result => {
        callback(undefined, result)
      }
    } else {
      onSuccess = result => {
        return new Promise(resolve => resolve(result))
      }
      onError = result => {
        return new Promise((resolve, reject) => reject(result))
      }
    }
    window.webViewBridge.send(
      'processTransaction',
      transaction,
      onSuccess,
      onError
    )
  }

  getAccounts(callback) {
    const data = null
    let onSuccess
    if (callback) {
      onSuccess = result => {
        callback(undefined, result)
      }
    } else {
      onSuccess = result => {
        return new Promise(resolve => resolve(result))
      }
    }
    window.webViewBridge.send('getAccounts', data, onSuccess)
  }

  signMessage(data, callback) {
    let onSuccess, onError
    if (callback) {
      onSuccess = result => {
        callback(undefined, result)
      }
      onError = result => {
        callback(undefined, result)
      }
    } else {
      onSuccess = result => {
        return new Promise(resolve => resolve(result))
      }
      onError = result => {
        return new Promise((resolve, reject) => reject(result))
      }
    }
    window.webViewBridge.send('signMessage', data, onSuccess, onError)
  }

  signPersonalMessage(data, callback) {
    let onSuccess, onError
    if (callback) {
      onSuccess = result => {
        callback(undefined, result)
      }
      onError = result => {
        callback(undefined, result)
      }
    } else {
      onSuccess = result => {
        return new Promise(resolve => resolve(result))
      }
      onError = result => {
        return new Promise((resolve, reject) => reject(result))
      }
    }
    window.webViewBridge.send('signPersonalMessage', data, onSuccess, onError)
  }

  getProvider() {
    const rpcUrl = this.web3.eth.net.currentProvider.host

    const provider = ZeroClientProvider({
      rpcUrl,
      getAccounts: this.getAccounts.bind(this),
      processTransaction: this.processTransaction.bind(this),
      signMessage: this.signMessage.bind(this),
      signPersonalMessage: this.signPersonalMessage.bind(this),
      engineParams: {
        blockTracker: this.blockTracker
      }
    })

    // Disable caching subProviders, because they interfere with the provider
    // we're returning.
    const providersToRemove = [
      'BlockCacheSubprovider',
      'InflightCacheSubprovider'
    ]
    provider._providers = provider._providers.filter(
      provider => !providersToRemove.includes(provider.constructor.name)
    )
    provider._providers.unshift(new EthGasStationProvider())
    provider.isOrigin = true

    return provider
  }
}

export default function MobileBridgeFunc(opts) {
  return new MobileBridge(opts)
}
