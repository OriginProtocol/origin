const assert = require('assert')
const Web3 = require('web3')

const { createProvider } = require('@origin/token/src/config')

//const helper = require('./_helper')
const Token = require('../src/token')


// These tests are for the token library that the token faucet uses. We don't
// validate the effects of various basic OriginToken operations. That is left
// to the contract tests.
describe('Token CLI Library', async function() {
  const networkId = 999
  let supplier
  let TokenLib

  beforeEach(async function() {
    //({
    //  deploy,
    //  accounts,
    //  web3,
    //} = await helper(`${__dirname}/..`))
    //owner = accounts[0]
    //nonOwner = accounts[1]
    /*
    OriginToken = await deploy('OriginToken', {
      log: true,
      from: owner,
      path: `${__dirname}/../../contracts/contracts/token/`,
      args: [supply]
    })
    */
    TokenLib = new Token(networkId, createProvider(networkId))

    supplier = await TokenLib.defaultAccount()
  })

  it('credits an account', async () => {
    const supplierBalance = await TokenLib.balance(supplier)
    const to = '0xD85A569F3C26f81070544451131c742283360400'
    const amount = 100
    const txHash = await TokenLib.credit(to, amount)
    const { txStatus, receipt } = await TokenLib.waitForTxConfirmation(
      txHash,
      { numBlocks: 1, timeoutSec: 5 }
    )
    assert.equal(txStatus, 'confirmed')
    assert.notEqual(receipt, null)
    assert.equal(await TokenLib.balance(networkId, supplier), supplierBalance - amount)
    assert.equal(await TokenLib.balance(networkId, to), amount)
  })
})
