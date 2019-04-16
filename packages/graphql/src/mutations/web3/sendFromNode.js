import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function sendFromNode(_, { from, to, value }) {
  await checkMetaMask(from)
  const web3 = contracts.web3Exec
  return txHelper({
    web3,
    from,
    to,
    value: web3.utils.toWei(value, 'ether'),
    gas: 4612388,
    mutation: 'sendFromNode'
  })
}

export default sendFromNode
