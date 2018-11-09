import assert from 'assert'
import helper, { contractPath } from './_helper'
import Token from '../lib/token'

// These tests are for the token library that the token CLI uses. We don't
// validate the effects of various operations. That is left to the contract
// tests.
describe('Token CLI Library', async function() {
  const supply = 1000
  const networkId = '999'

  let accounts, deploy, web3
  let owner, nonOwner
  let OriginToken
  let TokenLib

  beforeEach(async function() {
    ({
      deploy,
      accounts,
      web3,
    } = await helper(`${__dirname}/..`))
    owner = accounts[0]
    nonOwner = accounts[1]
    OriginToken = await deploy('OriginToken', {
      from: owner,
      path: `${contractPath}/token/`,
      args: [supply]
    })
    TokenLib = new Token({
      networkId,
      verbose: false,
      providers: {
        '999': web3.currentProvider
      },
      contractAddress: OriginToken._address
    })
  })

  it('credits an account', async () => {
    const amount = 100
    await TokenLib.credit(networkId, nonOwner, amount)
    assert.equal(await TokenLib.balance(networkId, owner), supply - amount)
    assert.equal(await TokenLib.balance(networkId, nonOwner), amount)
  })

  it('pauses and unpauses token transfers', async () => {
    await TokenLib.pause(networkId)
    assert(await OriginToken.methods.paused().call())
    await TokenLib.unpause(networkId)
    assert(!(await OriginToken.methods.paused().call()))
  })

  it('sets the owner of the token', async () => {
    const newOwner = accounts[1]
    TokenLib.validOwners = {}
    TokenLib.validOwners[networkId] = [ newOwner ]
    await TokenLib.setOwner(networkId, newOwner)
    assert.equal(newOwner, await TokenLib.owner(networkId))
  })

  it('does not set owner to non-whitelisted address', async () => {
    const invalidOwner = accounts[5]
    TokenLib.validOwners = {}
    TokenLib.validOwners[networkId] = [ owner ]
    try {
      await TokenLib.setOwner(networkId, invalidOwner)
      assert(false)
    } catch(e) {
      assert(e.message.match(/not a valid owner/))
    }
  })

  it('allows owner to be any address with an empty whitelist', async () => {
    const newOwner = accounts[1]
    TokenLib.validOwners = {}
    TokenLib.validOwners[networkId] = [ ]
    await TokenLib.setOwner(networkId, newOwner)
    assert.equal(newOwner, await TokenLib.owner(networkId))
  })

  it('sends a multi-sig transaction', async () => {
    const owners = accounts.slice(0, 3)
    const MultiSigWallet = await deploy('MultiSigWallet', {
      from: owner,
      path: `${__dirname}/contracts/`,
      args: [owners, 2]
    })

    // Make the multi-sig wallet the contract owner.
    TokenLib.validOwners = {}
    TokenLib.validOwners[networkId] = [ MultiSigWallet._address ]
    await TokenLib.setOwner(networkId, MultiSigWallet._address)

    // Send pause contract call with 1 of 3 signatures.
    TokenLib.config.multisig = MultiSigWallet._address
    await TokenLib.pause(networkId)
    assert(!(await OriginToken.methods.paused().call()))

    // Confirm the multi-sig transaction with a second signature, which will
    // then pause the token.
    await MultiSigWallet.methods.confirmTransaction(0).send({ from: owners[1] })
    assert(await OriginToken.methods.paused().call())
  })
})
