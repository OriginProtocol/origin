import txHelper, { checkMetaMask } from './_txHelper'
import contracts from '../contracts'

async function sendFromWallet(_, { from, to, value }) {
  await checkMetaMask(from)
  const web3 = contracts.web3Exec
  return txHelper({
    tx: web3.eth.sendTransaction({ from, to, value, gas: 4612388 }),
    mutation: 'sendFromWallet'
  })
}

export default sendFromWallet
