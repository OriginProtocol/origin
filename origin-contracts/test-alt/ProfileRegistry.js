import assert from 'assert'
import helper, { contractPath } from './_helper'

describe('ProfileRegistry', async function() {
  let user, registry

  before(async () => {
    const { deploy, accounts } = await helper(`${__dirname}/..`)
    const deployer = accounts[0]
    user = accounts[1]

    registry = await deploy('ProfileRegistry', {
      from: deployer,
      path: `${contractPath}/identity/`
    })
  })

  it('profile update', async function() {
    const ipfsHash = '0x1234567890123456789012345678901234567890123456789012345678901234'
    await registry.methods.updateProfile(ipfsHash).send({ from: user })

    // Check profile hash was set.
    const profileHash = await registry.methods.profiles(user).call()
    assert.equal(profileHash, ipfsHash)

    // Check last event emitted is an update.
    const events = await registry.getPastEvents(
      'ProfileUpdated',
      { filter: { user } },
    )
    const updateEvent = events[0]
    assert.equal(updateEvent.returnValues.account, user)
    assert.equal(updateEvent.returnValues.ipfsHash, ipfsHash)
  })

  it('profile delete', async function() {
    await registry.methods.deleteProfile().send({ from: user })

    // Check profile hash was deleted.
    const profileHash = await registry.methods.profiles(user).call()
    const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
    assert.equal(profileHash, emptyHash)

    // Check last event emitted is a delete.
    const events = await registry.getPastEvents(
      'ProfileDeleted',
      { filter: { user } },
    )
    const deleteEvent = events[0]
    assert.equal(deleteEvent.returnValues.account, user)
  })

})