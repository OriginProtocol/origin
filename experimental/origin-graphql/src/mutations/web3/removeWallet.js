import contracts from '../../contracts'

export default async (_, args) => {
  return new Promise(resolve => {
    const web3 = contracts.web3
    const wallet = web3.eth.accounts.wallet[args.address]
    let privateKeys = []
    try {
      privateKeys = JSON.parse(window.localStorage.privateKeys).filter(
        k => wallet.privateKey !== k
      )
    } catch (e) {
      /* Ignore */
    }
    window.localStorage.privateKeys = JSON.stringify(privateKeys)
    web3.eth.accounts.wallet.remove(args.address)
    resolve(true)
  })
}
