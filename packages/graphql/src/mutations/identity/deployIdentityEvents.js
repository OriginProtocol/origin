import IdentityEvents from '@origin/contracts/build/contracts/IdentityEvents'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts, { setIdentityEvents } from '../../contracts'

const isBrowser = typeof window !== 'undefined'

async function deployIdentityEvents(_, { from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(IdentityEvents.abi)
  const tx = Contract.deploy({ data: IdentityEvents.bytecode }).send({
    gas: 5500000,
    from
  })

  return txHelper({
    tx,
    from,
    mutation: 'deployIdentityEvents',
    onReceipt: receipt => {
      Contract.options.address = receipt.contractAddress
      if (contracts.net === 'localhost' && isBrowser) {
        window.localStorage.identityEventsContract = receipt.contractAddress
      }
      setIdentityEvents(receipt.contractAddress, receipt.blockNumber)
    }
  })
}

export default deployIdentityEvents
