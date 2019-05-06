import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function sendFromWallet(_, { from, to, value }) {
  await checkMetaMask(from)

  return txHelper({
    web3: contracts.web3Exec,
    from,
    to,
    value,
    gas: 4612388,
    mutation: 'sendFromWallet'
  })
}

export default sendFromWallet
