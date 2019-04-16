import IdentityEvents from '@origin/contracts/build/contracts/IdentityEvents'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts, { setIdentityEvents } from '../../contracts'

async function deployIdentityEvents(_, { from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(IdentityEvents.abi)

  return txHelper({
    tx: Contract.deploy({ data: IdentityEvents.bytecode }),
    from,
    gas: 5500000,
    mutation: 'deployIdentityEvents',
    onReceipt: receipt => {
      Contract.options.address = receipt.contractAddress
      setIdentityEvents(receipt.contractAddress, receipt.blockNumber)
    }
  })
}

export default deployIdentityEvents
