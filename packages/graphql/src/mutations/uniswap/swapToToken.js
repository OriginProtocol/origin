import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

export async function swapToTokenTx(tokenValue) {
  const exchange = contracts.daiExchangeExec

  // The uniswap contract requires to specify a deadline which is a timestamp
  // in second after which the transaction can no longer be executed.
  // See method tokenToExchangeSwapOutput here:
  //   https://github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_exchange.vy
  //
  // Under normal condition it should not take more than a couple minutes
  // for the transaction to get mined. But in case the network is extremely
  // congested, we set the deadline to a conservative value of 1 hour from now.
  //
  // We use max of (now, block.timestamp) to calculate the current time because:
  //  - The local clock could be skewed
  //  - When running in test/dev environment blocks may not be mined for some time.
  const blockNumber = await contracts.web3.eth.getBlockNumber()
  const block = await contracts.web3.eth.getBlock(blockNumber)
  const localTimestamp = Math.round(+new Date() / 1000)
  const deadline = Math.max(localTimestamp, block.timestamp) + 60 * 60

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
