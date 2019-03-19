import contracts from '../contracts'

export default {
  balance: async tokenHolder => {
    try {
      const token = contracts.tokens.find(t => t.id === tokenHolder.token.id)
      return await token.contract.methods
        .balanceOf(tokenHolder.account.id)
        .call()
    } catch (e) {
      return null
    }
  },
  allowance: async (token, args) => {
    if (token.symbol === 'OGN') {
      let contract = args.contract
      if (contract === 'marketplace') {
        contract = localStorage.marketplaceContract
      }
      if (!contracts.ogn) return null
      const balance = await contracts.ogn.methods
        .allowance(token.account, contract)
        .call()
      return balance
    }
    return null
  }
}
