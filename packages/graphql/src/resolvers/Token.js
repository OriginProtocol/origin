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
    const currency = await currencies.get(token.id)
    return currency ? currency.priceInUSD : null
  },
  balance: async (token, { address, format }) => {
    const web3 = contracts.web3
    const toBN = web3.utils.toBN
    let balance
    if (token.code === 'ETH') {
      balance = await web3.eth.getBalance(address)
    } else {
      const contract = tokenContract(token.code)
      if (!contract) return null
      balance = await contract.methods.balanceOf(address).call()
    }

    if (format && token.decimals && balance) {
      const base = toBN(10).pow(toBN(token.decimals))
      const dm = toBN(balance).divmod(base)
      let mod = web3.utils.padLeft(dm.mod.toString(), token.decimals, '0')
      mod = mod.substr(0, 5).replace(/0+$/, '')
      return `${dm.div}${mod ? `.${mod}` : ''}`
    }

    return balance
  },
  allowance: async (token, { address, target }) => {
    const contract = tokenContract(token.code)
    if (!contract) return null
    if (!target) return null
    return await contract.methods.allowance(address, target).call()
  }
}
