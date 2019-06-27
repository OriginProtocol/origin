const Web3 = require('web3')
const { createEngine } = require('@origin/web3-provider')
const assert = require('assert')

const TEST_PROVIDER_URL = 'http://localhost:8545'

/**
 * TODO: Basically all testing
 */

describe('web3-provider', function() {
  let web3
  let admin, bob

  before(async () => {
    web3 = new Web3(TEST_PROVIDER_URL)
    ;[admin, bob] = await web3.eth.getAccounts()
  })

  after(() => {
    // Stop its block poller so the test suite can wrap up
    web3.currentProvider.stop()
  })

  it('sends a basic transaction', async () => {
    createEngine(web3, {
      rpcUrl: TEST_PROVIDER_URL
    })
    assert(typeof web3.currentProvider.sendAsync !== 'undefined')

    const receipt = await web3.eth.sendTransaction({
      from: admin,
      to: bob,
      value: '1',
      gas: 21000,
      gasPrice: web3.utils.toWei('2', 'gwei')
    })

    assert(receipt.status, 'Transaction failed')
  })
})
