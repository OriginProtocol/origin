export default {
  id: contract => contract.id,
  address: contract => contract.id,
  name: async token => {
    if (token.name) return token.name
    try {
      return await token.contract.methods.name().call()
    } catch (e) {
      return null
    }
  },
  symbol: async token => {
    if (token.symbol) return token.symbol
    try {
      return await token.contract.methods.symbol().call()
    } catch (e) {
      return null
    }
  },
  decimals: async token => {
    if (token.decimals) return token.decimals
    try {
      return await token.contract.methods.decimals().call()
    } catch (e) {
      return null
    }
  },
  totalSupply: async token => {
    if (!token.contract) return null
    return await token.contract.methods.totalSupply().call()
  },
  exchangeRate: async (token, args) => {
    const currency = args.currency || 'USD'
    if (currency === 'USD') {
      return 200
    } else {
      return 200
    }
  }
}
