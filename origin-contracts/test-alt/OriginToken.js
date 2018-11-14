import assert from 'assert'
import helper, { assertRevert, assertRevertWithMessage, contractPath } from './_helper'

// These tests are specifically for the OriginToken contract and not for any
// contracts from which it inherits. Any OpenZeppelin contracts are covered
// by the OpenZeppelin Truffle tests.
describe('OriginToken.sol', async function() {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const initialSupply = 100
  const transferAmount = 10
  const burnAmount = 7

  let accounts, deploy, web3
  let owner, account1
  let OriginToken, Spender

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
    Spender = await deploy('Spender', {
      from: owner,
      path: `${__dirname}/contracts/`,
      args: [OriginToken._address]
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

  describe('approveAndCallWithSender', async function() {
    it('passes the correct parameters to the called contract', async function() {
      let res
      const amount = 10
      const bytes32 = '0xdeadbeef12432342432300000000000000000000000000000000000000000000'
      const bool = true
      const uint8 = 174
      const uint32 = '1714639093'
      const uint256 = '2260611357253958188'
      const int8 = -123
      const int256 = '-2432429611987047402'
      res = await OriginToken.methods.addCallSpenderWhitelist(Spender._address).send({from: owner})
      assert(res.events.AddCallSpenderWhitelist)

      const sig = web3.eth.abi.encodeFunctionSignature(
        'transferTokens(address,uint256,bytes32,bool,uint8,uint32,uint256,int8,int256)'
      )
      const params = web3.eth.abi.encodeParameters(
        [ 'uint256', 'bytes32', 'bool', 'uint8', 'uint32', 'uint256', 'int8', 'int256' ],
        [ amount,    bytes32,   bool,   uint8,   uint32,   uint256,   int8,   int256 ]
      )
      res = await OriginToken.methods
        .approveAndCallWithSender(Spender._address, amount, sig, params)
        .send({from: owner})

      assert(res.events.Approval)
      assert.equal(
        await OriginToken.methods.balanceOf(Spender._address).call(),
        amount
      )
      assert.equal(await Spender.methods.sender().call(), owner)
      assert.equal(await Spender.methods.storedBytes32().call(), bytes32)
      assert.equal(await Spender.methods.storedBool().call(), bool)
      assert.equal(await Spender.methods.storedUint8().call(), uint8)
      assert.equal(await Spender.methods.storedUint32().call(), uint32)
      assert.equal(await Spender.methods.storedUint256().call(), uint256)
      assert.equal(await Spender.methods.storedInt8().call(), int8)
      assert.equal(await Spender.methods.storedInt256().call(), int256)
    })

    it('allows owner to add to spender whitelist', async function() {
      const whitelisted = accounts[2]
      let res
      res = await OriginToken.methods.addCallSpenderWhitelist(whitelisted).send({from: owner})
      assert(res.events.AddCallSpenderWhitelist)
    })

    it('allows owner to remove from spender whitelist', async function() {
      const whitelisted = accounts[2]
      let res
      res = await OriginToken.methods.addCallSpenderWhitelist(whitelisted).send({from: owner})
      assert(res.events.AddCallSpenderWhitelist)
      res = await OriginToken.methods.removeCallSpenderWhitelist(whitelisted).send({from: owner})
      assert(res.events.RemoveCallSpenderWhitelist)
    })

    it('does not allow non-owners to add to spender whitelist', async function() {
      const nonOwner = accounts[4]
      await assertRevert(
        OriginToken.methods.addCallSpenderWhitelist(nonOwner).send({from: nonOwner})
      )
    })

    it('does not allow non-owners to remove from spender whitelist', async function() {
      const whitelisted = accounts[2]
      const nonOwner = accounts[3]
      await OriginToken.methods.addCallSpenderWhitelist(whitelisted).send({from: owner})
      await assertRevert(
        OriginToken.methods.removeCallSpenderWhitelist(whitelisted).send({from: nonOwner})
      )
    })

    it('does not allow call with spender not in whitelist', async function() {
      await assertRevertWithMessage('spender not in whitelist',
        OriginToken.methods
          .approveAndCallWithSender(ZERO_ADDRESS, 5, '0xdeadbeef', '0xdeadbeef')
          .send({ from: owner })
    )
    })

    it('does not allow token contract to call itself', async function() {
      const transferSig = web3.eth.abi.encodeFunctionSignature(
        'transferFrom(address,address,uint256)'
      )
      const params = web3.eth.abi.encodeParameters(
        ['address', 'address', 'uint256'],
        [owner, account1, 5]
      )
      await assertRevertWithMessage(`token contract can't be approved`,
        OriginToken.methods
          .approveAndCallWithSender(OriginToken._address, 5, transferSig, params)
          .send({from: owner})
      )
    })
  })
})
