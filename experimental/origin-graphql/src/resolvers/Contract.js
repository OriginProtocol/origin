import balancesFromWei from 'utils/balancesFromWei'
import contracts from '../contracts'

export default {
  balance: async contract => {
    const wei = await contracts.web3.eth.getBalance(contract.id)
    return balancesFromWei(wei)
  },
  type: contract => {
    let types = {}
    try {
      types = JSON.parse(window.localStorage.contractTypes)
    } catch (e) {
      /* Ignore */
    }
    return types[contract.id]
  },
  name: contract => {
    let names = {}
    try {
      names = JSON.parse(window.localStorage.contractNames)
    } catch (e) {
      /* Ignore */
    }
    return names[contract.id]
  },
  token: async (contract, args) => {
    if (args.symbol === 'OGN') {
      const balance = await contracts.ogn.methods.balanceOf(contract.id).call()
      return {
        id: `${args.symbol}_${contract.id}`,
        account: contract.id,
        symbol: args.symbol,
        balance
      }
    }
    return null
  }
}
