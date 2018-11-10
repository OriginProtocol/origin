import contracts from '../contracts'

let ethPrice

export default {
  web3: () => ({}),
  marketplace: () => contracts.marketplace,
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
  token: (_, args) => contracts.tokens.find(t => t.id === args.id),
  ethUsd: () =>
    new Promise((resolve, reject) => {
      if (ethPrice) {
        return resolve(ethPrice)
      }
      fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
        .then(response => response.json())
        .then(response => {
          ethPrice = response.USD
          resolve(ethPrice)
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
