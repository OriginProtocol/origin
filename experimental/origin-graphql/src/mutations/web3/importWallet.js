import contracts from '../../contracts'
import balancesFromWei from '../../utils/balancesFromWei'
import storeWallet from './_storeWallet'

export default (_, { name, role, privateKey }) => {
  const web3 = contracts.web3
  const existing = Object.keys(web3.eth.accounts.wallet)
    .filter(k => k.match(/^[0-9]$/))
    .map(idx => web3.eth.accounts.wallet[idx].address)

  web3.eth.accounts.wallet.add(privateKey)

  const id = Object.keys(web3.eth.accounts.wallet)
    .filter(k => k.match(/^[0-9]$/))
    .map(idx => web3.eth.accounts.wallet[idx].address)
    .find(id => existing.indexOf(id) < 0)

  storeWallet({ id, name, role, privateKey })
  return { id, role, name, balance: balancesFromWei(id) }
}
