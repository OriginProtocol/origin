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

  const marketValue = await exchange.methods
    .getEthToTokenOutputPrice(tokenValue)
    .call()

  // We send 1% extra value to cover 99% of market price moves.
  // See https://github.com/OriginProtocol/origin/issues/2771
  // for how this amount was determined.
  //
  // Marketplace prices change on average every 10 blocks.
  // It takes some time to finish a transaction, and the exchange will
  // fail our transaction if the user did not send enough eth for
  // the new price.
  const toBN = contracts.web3.utils.toBN
  const value = toBN(marketValue)
    .mul(toBN(102))
    .div(toBN(100))
    .toString()

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
