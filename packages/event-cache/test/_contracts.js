import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import TestTokenContract from '@origin/contracts/build/contracts/TestToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'

import Web3 from 'web3'

// Mainnet should be fine for read-only testing
export const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

export default {
  'marketplace': new web3.eth.Contract(MarketplaceContract.abi, null, {
    data: MarketplaceContract.bytecode
  }),
  'token': new web3.eth.Contract(TestTokenContract.abi, null, {
    data: TestTokenContract.bytecode
  }),
  'identity': new web3.eth.Contract(IdentityEventsContract.abi, null, {
    data: IdentityEventsContract.bytecode
  })
}
