import currencies from '../utils/currencies'
import contracts from '../contracts'

function tokenContract(id) {
  const found = contracts.tokens.find(t => t.symbol === id)
  return found ? found.contract : null
}

export default {
  id: contract => contract.id,
  address: token => {
    return token.id
  },
  name: async token => {
    if (token.name) return token.name
    try {
      return await token.contract.methods.name().call()
    } catch (e) {
      return null
    }
  },
  code: async token => {
    const currency = currencies.data[token.id]
    if (currency) {
      return currency.code
    }
    if (token.code) return token.code
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
    const contract = tokenContract(token.code)
    if (!contract) return ''
    return await contract.methods.totalSupply().call()
  },
  priceInUSD: async token => {
    if (await currencies.get(token.id)) {
      return await currencies.get(token.id).priceInUSD
    }
    return null
  },
  balance: async (token, { address }) => {
    if (token.code === 'ETH') {
      return await contracts.web3.eth.getBalance(address)
    }
    const contract = tokenContract(token.code)
    if (!contract) return null
    return await contract.methods.balanceOf(address).call()
  },
  allowance: async (token, { address, target }) => {
    const contract = tokenContract(token.code)
    if (!contract) return null
    if (!target) return null
    if (target === 'marketplace') {
      target = contracts.marketplace.options.address
    }
    return await contract.methods.allowance(address, target).call()
  }
}
