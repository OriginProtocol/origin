import { factoryAbi } from '../../contracts/UniswapExchange'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

const isBrowser = typeof window !== 'undefined'

async function uniswapInitializeFactory(_, { from, exchange, factory }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  if (!exchange && isBrowser) {
    exchange = window.localStorage.uniswapExchangeTemplate
  }
  if (!factory && isBrowser) {
    factory = window.localStorage.uniswapFactory
  }
  if (!exchange) {
    throw new Error('No exchange template found')
  }
  const uniswapFactory = new web3.eth.Contract(factoryAbi, factory)
  const tx = uniswapFactory.methods.initializeFactory(exchange).send({
    gas: 5500000,
    from
  })

  return txHelper({ tx, from, mutation: 'uniswapInitializeFactory' })
}

export default uniswapInitializeFactory
