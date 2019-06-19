import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

export async function swapToTokenTx(tokenValue) {
  const exchange = contracts.daiExchangeExec
  const blockNumber = await contracts.web3.eth.getBlockNumber()
  const block = await contracts.web3.eth.getBlock(blockNumber)

  // If we're running on a private blockchain that hasn't mined a block
  // recently, use a more recent timestamp
  const now = Math.round(+new Date() / 1000)
  const deadline = (block.timestamp < now - 60 ? now : block.timestamp) + 300

  const value = await exchange.methods
    .getEthToTokenOutputPrice(tokenValue)
    .call()

  const tx = exchange.methods.ethToTokenSwapOutput(tokenValue, deadline)
  return { tx, value }
}

async function swapToToken(_, { from, token, tokenValue }) {
  if (token !== 'token-DAI') {
    throw new Error('Only swapping to DAI is currently supported')
  }
  if (!contracts.daiExchange) {
    throw new Error('No exchange contract found')
  }
  await checkMetaMask(from)

  const { value, tx } = await swapToTokenTx(tokenValue)
  return txHelper({ tx, from, mutation: 'swapToToken', value, gas: 103828 })
}

export default swapToToken
