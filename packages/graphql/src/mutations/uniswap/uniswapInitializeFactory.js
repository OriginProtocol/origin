import { factoryAbi } from '../../contracts/UniswapExchange'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function uniswapInitializeFactory(_, { from, exchange }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  if (!exchange) {
    exchange = window.localStorage.uniswapExchangeTemplate
  }
  if (!exchange) {
    throw new Error('No exchange template found')
  }
  const uniswapFactory = new web3.eth.Contract(
    factoryAbi,
    window.localStorage.uniswapFactory
  )
  const tx = uniswapFactory.methods.initializeFactory(exchange).send({
    gas: 5500000,
    from
  })

  return txHelper({ tx, from, mutation: 'uniswapInitializeFactory' })
}

export default uniswapInitializeFactory
