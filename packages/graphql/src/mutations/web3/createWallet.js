import contracts from '../../contracts'
import balancesFromWei from '../../utils/balancesFromWei'
import storeWallet from './_storeWallet'

export default (_, args) => {
  const web3 = contracts.web3
  const existing = Object.keys(web3.eth.accounts.wallet)
    .filter(k => k.match(/^[0-9]+$/))
    .map(idx => web3.eth.accounts.wallet[idx].address)

  const wallet = web3.eth.accounts.wallet.create(1)
  const id = Object.keys(web3.eth.accounts.wallet)
    .filter(k => k.match(/^[0-9]+$/))
    .map(idx => web3.eth.accounts.wallet[idx].address)
    .find(id => existing.indexOf(id) < 0)
  const { name, role } = args
  storeWallet({ id, name, role, privateKey: wallet[id].privateKey })
  return { id, role, name, balance: balancesFromWei(id) }
}
