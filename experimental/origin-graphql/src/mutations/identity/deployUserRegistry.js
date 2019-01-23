import UserRegistry from 'origin-contracts/build/contracts/V00_UserRegistry'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function deployUserRegistry(_, { from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(UserRegistry.abi)
  const tx = Contract.deploy({ data: UserRegistry.bytecode }).send({
    gas: 5500000,
    from
  })

  return txHelper({
    tx,
    from,
    mutation: 'deployUserRegistry',
    onReceipt: receipt => {
      Contract.options.address = receipt.contractAddress
      window.localStorage.userRegistry = receipt.contractAddress
      contracts.userRegistry = Contract
      contracts.userRegistryExec = Contract
    }
  })
}

export default deployUserRegistry
