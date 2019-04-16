import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function updateTokenAllowance(_, { token, from, to, value }) {
  let tokenContract = contracts.tokens.find(t => t.id === token)
  if (token.indexOf('token-') === 0) {
    tokenContract = contracts.tokens.find(
      t => t.symbol === token.split('token-')[1]
    )
  } else if (token === 'ogn') {
    tokenContract = { contractExec: contracts.ognExec }
  }
  if (!tokenContract) {
    throw new Error('Could not find contract to update allowance')
  }
  if (to === 'marketplace') {
    to = contracts.marketplace.options.address
  }
  await checkMetaMask(from)
  value = contracts.web3.utils.toWei(value, 'ether')
  const tx = tokenContract.contractExec.methods.approve(to, value)
  return txHelper({ tx, from, mutation: 'updateTokenAllowance', gas: 4612388 })
}

export default updateTokenAllowance
