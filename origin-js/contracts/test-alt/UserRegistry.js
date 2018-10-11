import assert from 'assert'
import helper, { contractPath } from './_helper'

describe('UserRegistry', async function() {
  let deploy, accounts, userRegistry

  beforeEach(async () => {
    ({
      deploy,
      accounts
    } = await helper(`${__dirname}/..`))
  })

  it('should be able to register a user', async function() {
    userRegistry = await deploy('V00_UserRegistry', {
      from: accounts[0],
      path: `${contractPath}/identity/`
    })

    const register = await userRegistry.methods.registerUser().send({ from: accounts[1] })
    const identityAddress = await userRegistry.methods.users(accounts[1]).call()
    const newUserEvents = await userRegistry.getPastEvents('NewUser')
    const newUserEvent = newUserEvents.length && newUserEvents[0]
    assert.equal(identityAddress, accounts[1])
    assert.equal(newUserEvent.returnValues['_address'], accounts[1])
    assert.equal(newUserEvent.returnValues['_identity'], accounts[1])
  })
})
