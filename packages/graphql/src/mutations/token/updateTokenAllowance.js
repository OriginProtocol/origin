import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import proxyOwner from '../../utils/proxyOwner'

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
    const owner = await proxyOwner(from)
    to = owner ? from : contracts.marketplace.options.address
  }
  console.log({ from, to })
  await checkMetaMask(from)
  value = contracts.web3.utils.toWei(value, 'ether')
  const tx = tokenContract.contractExec.methods.approve(to, value)
  const gas = await tx.estimateGas({ from })
  return txHelper({ tx, from, mutation: 'updateTokenAllowance', gas })
}

export default updateTokenAllowance
