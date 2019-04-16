import { exchangeAbi } from '../../contracts/UniswapExchange'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function uniswapAddLiquidity(
  _,
  { from, exchange, value, tokens, liquidity }
) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)

  const blockNumber = await contracts.web3.eth.getBlockNumber()
  const block = await contracts.web3.eth.getBlock(blockNumber)
  const now = Math.round(+new Date() / 1000)
  const deadline = (block.timestamp < now - 60 ? now : block.timestamp) + 300

  const uniswapDaiExchange = new web3.eth.Contract(exchangeAbi, exchange)
  const tx = uniswapDaiExchange.methods.addLiquidity(
    liquidity,
    web3.utils.toWei(tokens, 'ether'),
    deadline
  )

  return txHelper({
    tx,
    gas: 4000000,
    from,
    value: web3.utils.toWei(value, 'ether'),
    mutation: 'uniswapAddLiquidity'
  })
}

export default uniswapAddLiquidity
