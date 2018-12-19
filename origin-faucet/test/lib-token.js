import assert from 'assert'
import helper from './_helper'
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
      path: `${__dirname}/../../origin-contracts/contracts/token/`,
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
})
