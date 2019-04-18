import contracts from '../../contracts'
import storeWallet from './_storeWallet'

export default (_, { accounts }) => {
  const web3 = contracts.web3

  const wallets = accounts.map(({ name, role, privateKey }) => {
    const id = web3.eth.accounts.wallet.add(privateKey).address
    storeWallet({ id, name, role, privateKey })
    return id
  })

  return wallets.map(id => ({ id }))
}
