import { factoryAbi } from '../../contracts/UniswapExchange'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

const isBrowser = typeof window !== 'undefined'

async function uniswapCreateExchange(_, { from, tokenAddress, factory }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)

  if (!factory && isBrowser) {
    factory = window.localStorage.uniswapFactory
  }

  const uniswapFactory = new web3.eth.Contract(factoryAbi, factory)
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
