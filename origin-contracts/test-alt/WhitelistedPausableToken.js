import assert from 'assert'
import helper, { assertRevert, contractPath } from './_helper'

describe('WhitelistedPausableToken.sol', async function() {
  const initialSupply = 100
  const transferAmount = 1
  const senderBalance = transferAmount * 10
  const minWhitelistExpirationSecs = 86415 // a little more than day for coverage builds

  let accounts, deploy, web3, blockTimestamp, evmIncreaseTime
  let owner, sender, recipient
  let OriginToken

  // Helpers to reduce tedium of web3 calls
  async function balanceOf(address) {
    return await OriginToken.methods.balanceOf(address).call()
  }
  async function addAllowedTransactor(address) {
    const res = await OriginToken.methods.addAllowedTransactor(address).send()
    assert(res.events.AllowedTransactorAdded)
    return res
  }
  async function isAllowedTransactor(address) {
    return await OriginToken.methods.allowedTransactors(address).call()
  }
  async function removeAllowedTransactor(address) {
    const res = await OriginToken.methods.removeAllowedTransactor(address).send()
    assert(res.events.AllowedTransactorRemoved)
    return res
  }
  async function whitelistExpiration() {
    return await OriginToken.methods.whitelistExpiration().call()
  }
  async function setWhitelistExpiration(expiration) {
    const res = await OriginToken.methods.setWhitelistExpiration(expiration).send()
    assert(res.events.SetWhitelistExpiration)
    return res
  }


  beforeEach(async function() {
    ({
      deploy,
      accounts,
      web3,
      blockTimestamp,
      evmIncreaseTime,
    } = await helper(`${__dirname}/..`))
    owner = accounts[1]
    sender = accounts[2]
    recipient = accounts[3]

    OriginToken = await deploy('OriginToken', {
      from: owner,
      path: `${contractPath}/token/`,
      args: [initialSupply]
    })
    await OriginToken.methods.transfer(sender, senderBalance).send({ from: owner })
  })

  it('starts with an inactive whitelist', async function() {
    assert.equal(await OriginToken.methods.whitelistActive().call(), false)
  })

  it('allows transfers before activating whitelist', async function() {
    await OriginToken.methods.transfer(recipient, transferAmount).send({from: sender})
    assert.equal(await balanceOf(sender), senderBalance - transferAmount)
    assert.equal(await balanceOf(recipient), transferAmount)
  })

  it('disallows setting an unreasonably short whitelist expiration', async function() {
    const expiration = await blockTimestamp() + minWhitelistExpirationSecs - 60
    await assertRevert(setWhitelistExpiration(expiration))
  })

  it('allows extending the whitelist expiration', async function() {
    const expiration = await blockTimestamp() + minWhitelistExpirationSecs
    await setWhitelistExpiration(expiration)
    assert.equal(await whitelistExpiration(), expiration)
    const newExpiration = expiration + 86400
    await setWhitelistExpiration(newExpiration)
    assert.equal(await whitelistExpiration(), newExpiration)
  })

  it('allows extending the whitelist expiration with active whitelist', async function() {
    const expiration = await blockTimestamp() + minWhitelistExpirationSecs
    await setWhitelistExpiration(expiration)
    assert.equal(await whitelistExpiration(), expiration)
    const newExpiration = expiration + 86400
    await setWhitelistExpiration(newExpiration)
    assert.equal(await whitelistExpiration(), newExpiration)
  })

  it('disallows setting an expiration after it has already expired', async function() {
    const expiration = await blockTimestamp() + minWhitelistExpirationSecs
    await setWhitelistExpiration(expiration)
    assert.equal(await whitelistExpiration(), expiration)
    await evmIncreaseTime(minWhitelistExpirationSecs)
    assertRevert(setWhitelistExpiration(expiration + 10))
  })

  describe('with an active whitelist', async function() {
    beforeEach(async function() {
      const expiration = await blockTimestamp() + minWhitelistExpirationSecs
      await setWhitelistExpiration(expiration)
      assert.equal(await OriginToken.methods.whitelistActive().call(), true)
    })

    it('disallows transfers with an empty whitelist', async function() {
      await assertRevert(
        OriginToken.methods.transfer(recipient, 1).send({from: sender})
      )
      assert.equal(await balanceOf(sender), senderBalance)
    })

    it('lets a whitelisted sender to transfer tokens', async function() {
      await addAllowedTransactor(sender)
      assert.equal(await isAllowedTransactor(sender), true)
      assert.equal(await isAllowedTransactor(recipient), false)
      await OriginToken.methods.transfer(recipient, transferAmount).send({from: sender})
      assert.equal(await balanceOf(sender), senderBalance - transferAmount)
      assert.equal(await balanceOf(recipient), transferAmount)
    })

    it('does not let a removed sender transfer tokens', async function() {
      await addAllowedTransactor(sender)
      assert.equal(await isAllowedTransactor(sender), true)
      await removeAllowedTransactor(sender)
      assert.equal(await isAllowedTransactor(sender), false)
      assertRevert(
        OriginToken.methods.transfer(recipient, transferAmount).send({from: sender})
      )
    })

    it('lets any sender send to an allowed recipient', async function() {
      await addAllowedTransactor(recipient)
      assert.equal(await isAllowedTransactor(sender), false)
      assert.equal(await isAllowedTransactor(recipient), true)
      await OriginToken.methods.transfer(recipient, transferAmount).send({from: sender})
      assert.equal(await balanceOf(sender), senderBalance - transferAmount)
      assert.equal(await balanceOf(recipient), transferAmount)
    })

    it('does not let a removed recipient receive tokens', async function() {
      await addAllowedTransactor(recipient)
      assert.equal(await isAllowedTransactor(sender), false)
      assert.equal(await isAllowedTransactor(recipient), true)
      await removeAllowedTransactor(recipient)
      assert.equal(await isAllowedTransactor(recipient), false)
      assertRevert(
        OriginToken.methods.transfer(recipient, transferAmount).send({from: sender})
      )
    })

    describe('after whitelist expires', async function() {
      it('disables whitelist', async function() {
        assert.equal(await OriginToken.methods.whitelistActive().call(), true)
        await evmIncreaseTime(minWhitelistExpirationSecs)
        assert.equal(await OriginToken.methods.whitelistActive().call(), false)
      })

      it('allows any account to send or receive after whitelist expires', async function() {
        // Verify we have an empty, active whitelist
        assert.equal(await isAllowedTransactor(owner), false)
        assert.equal(await isAllowedTransactor(sender), false)
        assert.equal(await isAllowedTransactor(recipient), false)
        assert.equal(await OriginToken.methods.whitelistActive().call(), true)
        await assertRevert(
          OriginToken.methods.transfer(recipient, transferAmount).send({from: sender})
        )

        // Expire the whitelist
        await evmIncreaseTime(minWhitelistExpirationSecs)

        await OriginToken.methods.transfer(recipient, transferAmount).send({from: sender})
        assert.equal(await balanceOf(sender), senderBalance - transferAmount)
        assert.equal(await balanceOf(recipient), transferAmount)
      })
    })
  })
})
