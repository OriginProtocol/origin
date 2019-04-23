import messaging from './messaging/_messaging'

import contracts from '../contracts'
import creatorConfig from '../constants/CreatorConfig'
import currencies from '../utils/currencies'

const marketplaceExists = {}

import { identity } from './IdentityEvents'

export default {
  config: () => contracts.net,
  configObj: () => contracts.config,
  creatorConfig: async (_, args) => {
    let configUrl = args.creatorConfigUrl
    if (configUrl) {
      try {
        if (!configUrl.match(/^http/)) {
          configUrl = `${contracts.config.ipfsGateway}/ipns/${configUrl}`
        }
        const response = await fetch(configUrl)
        const json = await response.json()
        return Object.assign(creatorConfig, {
          ...json.config,
          isCreatedMarketplace: true
        })
      } catch (e) {
        console.log('Could not fetch marketplace config')
      }
    }
    return creatorConfig
  },
  web3: () => ({}),
  marketplace: async () => {
    const address = contracts.marketplace.options.address
    if (!address) {
      return null
    }
    if (marketplaceExists[address]) {
      return contracts.marketplace
    }
    try {
      const exists = await contracts.web3.eth.getCode(address)
      if (exists && exists.length > 2) {
        marketplaceExists[address] = true
        return contracts.marketplace
      }
      console.log(`Could not find marketplace at ${address}`)
    } catch (e) {
      console.log(`Error finding marketplace`, e)
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
  identityEvents: () => {
    const address = contracts.identityEvents.options.address
    if (!address) return null
    return contracts.identityEvents
  },
  identity: (_, args) => identity({ id: args.id }),
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
  ethUsd: async () => {
    return await currencies.get('token-ETH').priceInUSD
  },
  messaging: async (_, args) => {
    if (typeof window !== 'undefined' && window.localStorage.disableMessaging) {
      return null
    }

    let id = args.id
    if (id === 'defaultAccount') {
      // web3Exec is either MetaMask or a web3 instance using the mobile bridge
      const accounts = await contracts.web3Exec.eth.getAccounts()
      if (!accounts || !accounts.length) {
        return null
      }
      id = accounts[0]
    } else if (id === 'currentAccount') {
      if (contracts.messaging.account_key) {
        id = contracts.messaging.account_key
      }
    }
    id = contracts.web3.utils.toChecksumAddress(id)

    return await messaging(id)
  },

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
  },

  currency: async (_, args) => await currencies.get(args.id),
  currencies: async (_, args) => {
    let ids = currencies.ids()
    if (args.tokens) {
      ids = ids.filter(c => args.tokens.indexOf(c) >= 0)
    }
    return await Promise.all(ids.map(id => currencies.get(id)))
  }
}
