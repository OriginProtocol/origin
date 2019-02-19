import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function sendFromNode(_, { from, to, value }) {
  await checkMetaMask(from)
  const web3 = contracts.web3Exec
  const tx = web3.eth.sendTransaction({
    from,
    to,
    value: web3.utils.toWei(value, 'ether'),
    gas: 4612388
  })
  return txHelper({ tx, from, mutation: 'sendFromNode' })
}

export default sendFromNode
