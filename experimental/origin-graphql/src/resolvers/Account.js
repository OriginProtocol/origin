import balancesFromWei from '../utils/balancesFromWei'
import contracts from '../contracts'

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
  identity: async account => {
    const ur = contracts.userRegistry
    if (!ur || !ur.options.address) return null
    const id = await ur.methods.users(account.id).call()
    if (id.indexOf('0x0000') === 0) {
      return null
    }
    return { id }
  }
}
