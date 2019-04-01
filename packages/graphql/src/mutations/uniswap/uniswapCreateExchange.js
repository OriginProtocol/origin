import { factoryAbi } from '../../contracts/UniswapExchange'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function uniswapCreateExchange(_, { from, tokenAddress }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)

  const uniswapFactory = new web3.eth.Contract(
    factoryAbi,
    window.localStorage.uniswapFactory
  )
  const tx = uniswapFactory.methods.createExchange(tokenAddress).send({
    gas: 5500000,
    from
  })

  return txHelper({
    tx,
    from,
    mutation: 'uniswapCreateExchange',
    onReceipt: receipt => {
      if (typeof window !== 'undefined') {
        window.localStorage.uniswapDaiExchange =
          receipt.events.NewExchange.returnValues.exchange
      }
    }
  })
}

export default uniswapCreateExchange
