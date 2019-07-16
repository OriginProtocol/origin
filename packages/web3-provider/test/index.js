const Web3 = require('web3')
const fetch = require('cross-fetch')
const { createEngine, initStandardSubproviders } = require('@origin/web3-provider')
const assert = require('assert')

const TEST_PROVIDER_URL = 'http://localhost:8545'

async function getGasPrice(key) {
  const res = await fetch('https://ethgasstation.info/json/ethgasAPI.json')
  assert(res.status === 200, 'Wrong response code')
  const jason = await res.json()
  // values come from EGS as tenths of gwei
  return String(jason[key] * 1e8)
}

/**
 * TODO: Basically all testing
 */

describe('web3-provider', function() {
  let web3, web3b
  let admin, bob

  before(async () => {
    web3 = new Web3(TEST_PROVIDER_URL)
    web3b = new Web3(TEST_PROVIDER_URL)
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

  it('gets gas price from ethgasstation', async () => {
    initStandardSubproviders(web3b, {
      rpcUrl: TEST_PROVIDER_URL,
      ethGasStation: true
    })
    assert(typeof web3.currentProvider.sendAsync !== 'undefined')

    const egsPrice = await getGasPrice('safeLow')
    const price = await web3b.eth.getGasPrice()

    assert(typeof price === 'string', `Price is not a string`)
    assert(egsPrice === price, `${egsPrice} !== ${price}`)
  })
})
