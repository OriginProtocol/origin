import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function deployIdentityProxy(_, { from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(IdentityProxy.abi)

  return txHelper({
    tx: Contract.deploy({ data: IdentityProxy.bytecode }),
    from,
    gas: 5500000,
    mutation: 'deployIdentityProxy'
  })
}

export default deployIdentityProxy
