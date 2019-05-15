import ProxyFactory from '@origin/contracts/build/contracts/ProxyFactory_solc'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function deployProxyFactory(_, { from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(ProxyFactory.abi)

  return txHelper({
    tx: Contract.deploy({ data: ProxyFactory.bytecode }),
    from,
    gas: 5500000,
    mutation: 'deployProxyFactory'
  })
}

export default deployProxyFactory
