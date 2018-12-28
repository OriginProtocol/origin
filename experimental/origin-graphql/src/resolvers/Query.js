import contracts from '../contracts'

let ethPrice
const marketplaceExists = {},
  messagingInitialized = {}

export default {
  config: () => contracts.net,
  web3: () => ({}),
  marketplace: async () => {
    const address = contracts.marketplace.options.address
    if (marketplaceExists[address]) {
      return contracts.marketplace
    }
    try {
      const exists = await contracts.web3.eth.getCode(address)
      if (exists && exists.length > 2) {
        marketplaceExists[address] = true
        return contracts.marketplace
      }
    } catch(e) { /* Ignore */ }
  },
  contracts: () => {
    let contracts = []
    try {
      contracts = JSON.parse(window.localStorage.contracts)
    } catch (e) {
      /* Ignore  */
    }
    return contracts
  },
  marketplaces: () => contracts.marketplaces,
  userRegistry: () => {
    const address = contracts.userRegistry.options.address
    if (!address) return null
    return contracts.userRegistry
  },
  tokens: () => contracts.tokens,
  token: (_, args) => {
    if (args.id === '0x0000000000000000000000000000000000000000') {
      return {
        id: '0x0000000000000000000000000000000000000000',
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    }
    return contracts.tokens.find(t => t.id === args.id)
  },
  ethUsd: () =>
    new Promise((resolve, reject) => {
      if (ethPrice) {
        return resolve(ethPrice)
      }
      fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
        .then(response => response.json())
        .then(response => {
          ethPrice = response.USD
          resolve(response.USD)
        })
        .catch(reject)
    }),
  messaging: (_, args) =>
    new Promise(async resolve => {
      let id = args.id
      if (id === 'defaultAccount') {
        const accounts = await contracts.metaMask.eth.getAccounts()
        if (!accounts || !accounts.length) return null
        id = accounts[0]
      }
      if (messagingInitialized[id]) {
        return resolve({ id })
      }
      contracts.messaging.events.once('initRemote', async () => {
        messagingInitialized[id] = true
        setTimeout(() => resolve({ id }), 500)
      })
      await contracts.messaging.init(id)
    }),

  notifications: () => {
    return {
      pageInfo: {
        endCursor: '',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: ''
      },
      totalCount: 0,
      totalUnread: 0,
      nodes: []
    }
  }
}
