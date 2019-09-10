const ecies = require('eth-ecies')
const OriginMessaging = require('../src/Messaging').default
const Web3 = require('web3')
global.fetch = require('cross-fetch')

// Mocks localStorage / cookieStorage used by messaging
export class MemoryStorage {
  constructor() {
    this.data = {}
  }

  setItem(key, value) {
    this.data[key] = value
  }
  getItem(key) {
    return this.data[key]
  }
}

global.localStorage = new MemoryStorage()
global.WebSocket = () => {
  return { close: () => {} }
}

// Helper function to setup a new user for testing
export class MessagingUser {
  constructor({ name, address }) {
    this.name = name
    this.address = address

    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
    )
    this.messaging = new OriginMessaging({
      contractService: { web3: this.web3 },
      ecies,
      messagingNamespace: 'origin:experimental',
      globalKeyServer: 'https://messaging.dev.originprotocol.com',
      personalSign: false
    })
    this.messaging.currentStorage = new MemoryStorage()
  }

  async init({ enableMessaging }) {
    await this.messaging.init(this.address)
    if (enableMessaging) {
      await this.messaging.startConversing()
      await new Promise(function(resolve) {
        setTimeout.apply(null, [resolve].concat([1000]))
      })
    }
  }
}
