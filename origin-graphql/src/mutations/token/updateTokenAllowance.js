import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function updateTokenAllowance(_, { token, from, to, value }) {
  const tokenContract = contracts.tokens.find(t => t.id === token)
  if (!tokenContract) {
    throw new Error('Could not find contract to update allowance')
  }
  await checkMetaMask(from)
  value = contracts.web3.utils.toWei(value, 'ether')
  const tx = tokenContract.contractExec.methods.approve(to, value).send({
    gas: 4612388,
    from
  })
  return txHelper({ tx, from, mutation: 'transferToken' })
}

export default updateTokenAllowance
