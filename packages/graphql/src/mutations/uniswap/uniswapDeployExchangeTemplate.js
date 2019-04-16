import { exchangeAbi, exchangeBytecode } from '../../contracts/UniswapExchange'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function uniswapDeployExchangeTemplate(_, { from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(exchangeAbi)
  const tx = Contract.deploy({ data: exchangeBytecode })

  return txHelper({ tx, from, gas: 5500000, mutation: 'uniswapDeployFactory' })
}

export default uniswapDeployExchangeTemplate
