import contracts from '../../contracts'
import storeWallet from './_storeWallet'

export default (_, { accounts }) => {
  const web3 = contracts.web3
  accounts.forEach(({ name, role, privateKey }) => {
    const existing = Object.keys(web3.eth.accounts.wallet)
      .filter(k => k.match(/^[0-9]$/))
      .map(idx => web3.eth.accounts.wallet[idx].address)

    web3.eth.accounts.wallet.add(privateKey)

    const id = Object.keys(web3.eth.accounts.wallet)
      .filter(k => k.match(/^[0-9]$/))
      .map(idx => web3.eth.accounts.wallet[idx].address)
      .find(id => existing.indexOf(id) < 0)

    storeWallet({ id, name, role, privateKey })
  })
  return true
}
