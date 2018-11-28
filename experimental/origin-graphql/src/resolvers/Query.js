import contracts from '../contracts'

let ethPrice, marketplaceExists = {}

export default {
  config: () => contracts.net,
  web3: () => ({}),
  marketplace: async () => {
    const address = contracts.marketplace.options.address
    if (marketplaceExists[address]) {
      return contracts.marketplace
    }
    const exists = await web3.eth.getCode(address)
    if (exists && exists.length > 2) {
      marketplaceExists[address] = true
      return contracts.marketplace
    }
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
      contracts.messaging.events.once('initialized', async () => {
        setTimeout(() => {
          resolve({ id: args.id })
        }, 500)
      })
      await contracts.messaging.init(args.id)
    })
}
