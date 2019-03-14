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
  const deadline = block.timestamp + 300
  const dai = contracts.web3.utils.toWei(tokenValue, 'ether')
  const value = await contracts.daiExchange.methods
    .getEthToTokenOutputPrice(dai)
    .call()

  const tx = contracts.daiExchangeExec.methods
    .ethToTokenSwapOutput(dai, deadline)
    .send({ from, value, gas: 50455 })

  return txHelper({ tx, from, mutation: 'swapToToken' })
}

export default swapToToken
