const MarketplaceContract = require('@origin/contracts/build/contracts/V00_Marketplace')
const TestTokenContract = require('@origin/contracts/build/contracts/TestToken')
const IdentityEventsContract = require('@origin/contracts/build/contracts/IdentityEvents')

const Web3 = require('web3')

// We're testing against a ganache instance launched from ./setup
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

module.exports =  {
  web3,
  marketplace: new web3.eth.Contract(MarketplaceContract.abi, null, {
    data: MarketplaceContract.bytecode
  }),
  token: new web3.eth.Contract(TestTokenContract.abi, null, {
    data: TestTokenContract.bytecode
  }),
  identity: new web3.eth.Contract(IdentityEventsContract.abi, null, {
    data: IdentityEventsContract.bytecode
  })
}
