const assert = require('assert')
const Token = require('../src/token')


// These tests are for the token library logic.
// They don't validate the token contract - those tests are part of the contracts package.
describe('Token Library', async function() {
  const networkId = 999
  let supplier, TokenLib

  before(async function() {
    TokenLib = new Token(networkId)
    supplier = await TokenLib.defaultAccount()
  })

  it('should credit an account', async () => {
    const supplierBalance = await TokenLib.balance(supplier)
    const to = '0x6c6e93874216112ef12a0d04e2679ecc6c3625cc'
    const amount = 100
    const txHash = await TokenLib.credit(to, amount)
    // Note: we use 0 block confirmation since ganache does not mine
    // new blocks unless there are transactions.
    const { status, receipt } = await TokenLib.waitForTxConfirmation(
      txHash,
      { numBlocks: 0 }
    )
    assert.equal(status, 'confirmed')
    assert.notEqual(receipt, null)
    assert.equal(await TokenLib.balance(supplier), supplierBalance - amount)
    assert.equal(await TokenLib.balance(to), amount)
  })
})
