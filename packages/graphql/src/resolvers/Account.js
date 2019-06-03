import balancesFromWei from '../utils/balancesFromWei'
import contracts from '../contracts'
import { hasProxy, predictedProxy } from '../utils/proxy'
import { identity } from './IdentityEvents'

export default {
  checksumAddress: account =>
    contracts.web3.utils.toChecksumAddress(account.id),
  balance: async account => {
    try {
      const wei = await contracts.web3.eth.getBalance(account.id)
      return balancesFromWei(wei)
    } catch (e) {
      return null
    }
  },
  role: account => {
    let roles = {}
    try {
      roles = JSON.parse(window.localStorage.accountRoles)
    } catch (e) {
      /* Ignore */
    }
    return roles[account.id]
  },
  name: account => {
    let names = {}
    try {
      names = JSON.parse(window.localStorage.accountNames)
    } catch (e) {
      /* Ignore */
    }
    return names[account.id]
  },
  token: async (account, args) => {
    const token = contracts.tokens.find(
      t => t.id === args.symbol || t.symbol === args.symbol
    )
    if (token) {
      return {
        id: `${args.symbol}_${account.id}`,
        account: { id: account.id },
        token
      }
    }
    return null
  },
  identity: async account => identity({ id: account.id }),
  owner: async account => {
    if (!contracts.config.proxyAccountsEnabled) {
      return { id: account.id }
    }
    const Proxy = contracts.ProxyImp.clone()
    Proxy.options.address = account.id
    try {
      const id = await Proxy.methods.owner().call()
      return id ? { id } : { id: account.id }
    } catch (e) {
      return { id: account.id }
    }
  },
  proxy: async account => {
    if (!contracts.config.proxyAccountsEnabled) {
      return { id: account.id }
    }
    const id = await hasProxy(account.id)
    return id ? { id } : { id: account.id }
  },
  predictedProxy: async account => {
    if (!contracts.config.proxyAccountsEnabled) {
      return { id: account.id }
    }
    const id = await predictedProxy(account.id)
    return id ? { id } : { id: account.id }
  }
}
