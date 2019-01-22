import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function updateTokenAllowance(_, { token, from, to, value }) {
  if (!contracts[token]) {
    return
  }
  await checkMetaMask(from)
  value = contracts.web3.utils.toWei(value, 'ether')
  const tx = contracts[token].methods.approve(to, value).send({
    gas: 4612388,
    from
  })
  return txHelper({ tx, from, mutation: 'transferToken' })
}

export default updateTokenAllowance
