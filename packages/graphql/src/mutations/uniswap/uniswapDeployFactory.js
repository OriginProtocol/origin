import { factoryAbi, factoryBytecode } from '../../contracts/UniswapExchange'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function uniswapDeployFactory(_, { from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(factoryAbi)
  const tx = Contract.deploy({ data: factoryBytecode }).send({
    gas: 5500000,
    from
  })

  return txHelper({
    tx,
    from,
    mutation: 'uniswapDeployFactory',
    onReceipt: receipt => {
      if (typeof window !== 'undefined') {
        window.localStorage.uniswapFactory = receipt.contractAddress
      }
    }
  })
}

export default uniswapDeployFactory
