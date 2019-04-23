import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function swapToToken(_, { from, token, tokenValue }) {
  if (token !== 'token-DAI') {
    throw new Error('Only swapping to DAI is currently supported')
  }
  if (!contracts.daiExchange) {
    throw new Error('No exchange contract found')
  }
  await checkMetaMask(from)

  const blockNumber = await contracts.web3.eth.getBlockNumber()
  const block = await contracts.web3.eth.getBlock(blockNumber)
  const now = Math.round(+new Date() / 1000)
  const deadline = (block.timestamp < now - 60 ? now : block.timestamp) + 300

  const value = await contracts.daiExchange.methods
    .getEthToTokenOutputPrice(tokenValue)
    .call()

  const tx = contracts.daiExchangeExec.methods
    .ethToTokenSwapOutput(tokenValue, deadline)
    .send({ from, value, gas: 103828 })

  return txHelper({ tx, from, mutation: 'swapToToken' })
}

export default swapToToken
