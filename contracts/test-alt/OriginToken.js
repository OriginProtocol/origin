import assert from 'assert'
import helper, { assertRevert, contractPath } from './_helper'

// These tests are specifically for the OriginToken contract and not for any
// contracts from which it inherits. Any OpenZeppelin contracts are covered
// by the OpenZeppelin Truffle tests.
describe('OriginToken.sol', async function() {
  const initialSupply = 100
  const transferAmount = 10
  const burnAmount = 7

  let accounts, deploy, web3
  let owner, account1
  let OriginToken

  async function assertBalanceEquals(address, balance) {
    assert.equal(
      await OriginToken.methods.balanceOf(address).call(),
      balance
    )
  }
  async function assertTotalSupplyEquals(totalSupply) {
    assert.equal(
      await OriginToken.methods.totalSupply().call(),
      totalSupply
    )
  }

  beforeEach(async function() {
    ({
      deploy,
      accounts,
      web3,
    } = await helper(`${__dirname}/..`))
    owner = accounts[1]
    account1 = accounts[2]

    OriginToken = await deploy('OriginToken', {
      from: owner,
      path: `${contractPath}/token/`,
      args: [initialSupply]
    })

    assert.equal(await OriginToken.methods.owner().call(), owner)
    await assertTotalSupplyEquals(initialSupply)
    await assertBalanceEquals(owner, initialSupply)
    await assertBalanceEquals(account1, 0)

    await OriginToken.methods.transfer(account1, transferAmount).send({from: owner})
    await assertBalanceEquals(owner, initialSupply - transferAmount)
    await assertBalanceEquals(account1, transferAmount)
  })

  it('does not allow regular accounts to burn tokens', async function() {
    await assertRevert(
      OriginToken.methods.burn(transferAmount).send({from: account1})
    )
  })

  it('allows owner to burn its own tokens', async function() {
    const res = await OriginToken.methods.burn(burnAmount).send({from: owner})
    assert(res.events.Burn)
    await assertTotalSupplyEquals(initialSupply - burnAmount)
    await assertBalanceEquals(owner, initialSupply - transferAmount - burnAmount)
    await assertBalanceEquals(account1, transferAmount)
  })

  it('does not allow regular accounts to burn other\'s tokens', async function() {
    await assertRevert(
      OriginToken.methods.burn(owner, transferAmount).send({from: account1})
    )
  })

  it('allows owner to burn others\' tokens', async function() {
    const res = await OriginToken.methods.burn(account1, burnAmount).send({from: owner})
    assert(res.events.Burn)
    await assertBalanceEquals(account1, transferAmount - burnAmount)
    await assertTotalSupplyEquals(initialSupply - burnAmount)
  })

  it('has the correct name', async function() {
    assert.equal(await OriginToken.methods.name().call(), 'OriginToken')
  })

  it('has the correct symbol', async function() {
    assert.equal(await OriginToken.methods.symbol().call(), 'OGN')
  })

  it('has the correct decimal places', async function() {
    assert.equal(await OriginToken.methods.decimals().call(), 18)
  })
})
