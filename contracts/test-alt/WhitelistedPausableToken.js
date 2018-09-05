import assert from 'assert'
import helper, { assertRevert, contractPath } from './_helper'

describe('WhitelistedPausableToken.sol', async function() {
  const initialSupply = 100
  const minWhitelistExpirationSecs = 86415 // a little more than day for coverage builds

  let accounts, deploy, web3, blockTimestamp, evmIncreaseTime
  let owner, account1, account2
  let OriginToken

  // Helpers to reduce tedium of web3 calls
  async function balanceOf(address) {
    return await OriginToken.methods.balanceOf(address).call()
  }
  async function addAllowedSender(address) {
    const res = await OriginToken.methods.addAllowedSender(address).send()
    assert(res.events.AllowedSenderAdded)
    return res
  }
  async function isAllowedSender(address) {
    return await OriginToken.methods.allowedSenders(address).call()
  }
  async function removeAllowedSender(address) {
    const res = await OriginToken.methods.removeAllowedSender(address).send()
    assert(res.events.AllowedSenderRemoved)
    return res
  }
  async function addAllowedRecipient(address) {
    const res = await OriginToken.methods.addAllowedRecipient(address).send()
    assert(res.events.AllowedRecipientAdded)
    return res
  }
  async function isAllowedRecipient(address) {
    return await OriginToken.methods.allowedRecipients(address).call()
  }
  async function removeAllowedRecipient(address) {
    const res = await OriginToken.methods.removeAllowedRecipient(address).send()
    assert(res.events.AllowedRecipientRemoved)
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
    account1 = accounts[2]
    account2 = accounts[3]

    OriginToken = await deploy('OriginToken', {
      from: owner,
      path: `${contractPath}/token/`,
      args: [initialSupply]
    })
  })

  it('starts with an inactive whitelist', async function() {
    assert.equal(await OriginToken.methods.whitelistActive().call(), false)
  })

  it('allows transfers before activating whitelist', async function() {
    const transferAmount = 1
    await OriginToken.methods.transfer(account1, transferAmount).send({from: owner})
    await OriginToken.methods.transfer(account2, transferAmount).send({from: account1})
    assert.equal(await balanceOf(owner), initialSupply - transferAmount)
    assert.equal(await balanceOf(account1), 0)
    assert.equal(await balanceOf(account2), transferAmount)
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
    const transferAmount = 2
    beforeEach(async function() {
      const expiration = await blockTimestamp() + minWhitelistExpirationSecs
      await setWhitelistExpiration(expiration)
      assert.equal(await OriginToken.methods.whitelistActive().call(), true)
    })

    it('disallows transfers with an empty whitelist', async function() {
      await assertRevert(
        OriginToken.methods.transfer(account1, 1).send({from: owner})
      )
      assert.equal(await balanceOf(owner), initialSupply)
    })

    it('lets a whitelisted sender to transfer tokens', async function() {
      await addAllowedSender(owner)
      assert.equal(await isAllowedSender(owner), true)
      assert.equal(await isAllowedRecipient(account1), false)
      await OriginToken.methods.transfer(account1, transferAmount).send({from: owner})
      assert.equal(await balanceOf(owner), initialSupply - transferAmount)
      assert.equal(await balanceOf(account1), transferAmount)
    })

    it('does not let a removed sender transfer tokens', async function() {
      await addAllowedSender(owner)
      assert.equal(await isAllowedSender(owner), true)
      await removeAllowedSender(owner)
      assert.equal(await isAllowedSender(owner), false)
      assertRevert(
        OriginToken.methods.transfer(account1, transferAmount).send({from: owner})
      )
    })

    it('lets any sender send to an allowed recipient', async function() {
      await addAllowedRecipient(account1)
      assert.equal(await isAllowedSender(owner), false)
      assert.equal(await isAllowedRecipient(account1), true)
      await OriginToken.methods.transfer(account1, transferAmount).send({from: owner})
      assert.equal(await balanceOf(owner), initialSupply - transferAmount)
      assert.equal(await balanceOf(account1), transferAmount)
    })

    it('does not let a removed recipient receive tokens', async function() {
      await addAllowedRecipient(account1)
      assert.equal(await isAllowedSender(owner), false)
      assert.equal(await isAllowedRecipient(account1), true)
      await removeAllowedRecipient(account1)
      assert.equal(await isAllowedRecipient(account1), false)
      assertRevert(
        OriginToken.methods.transfer(account1, transferAmount).send({from: owner})
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
        assert.equal(await isAllowedSender(owner), false)
        assert.equal(await isAllowedSender(account1), false)
        assert.equal(await isAllowedSender(account2), false)
        assert.equal(await isAllowedRecipient(owner), false)
        assert.equal(await isAllowedRecipient(account1), false)
        assert.equal(await isAllowedRecipient(account2), false)
        assert.equal(await OriginToken.methods.whitelistActive().call(), true)
        await assertRevert(
          OriginToken.methods.transfer(account1, transferAmount).send({from: owner})
        )

        // Expire the whitelist
        await evmIncreaseTime(minWhitelistExpirationSecs)

        await OriginToken.methods.transfer(account1, transferAmount).send({from: owner})
        assert.equal(await balanceOf(owner), initialSupply - transferAmount)
        assert.equal(await balanceOf(account1), transferAmount)
      })
    })
  })
})
