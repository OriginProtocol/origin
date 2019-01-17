import assert from 'assert'
import helper, { contractPath } from './_helper'

describe('IdentityEvents', async function() {
  let user, identityEvents

  before(async () => {
    const { deploy, accounts } = await helper(`${__dirname}/..`)
    const deployer = accounts[0]
    user = accounts[1]

    identityEvents = await deploy('IdentityEvents', {
      from: deployer,
      path: `${contractPath}/identity/`
    })
  })

  it('identity update', async function() {
    const ipfsHash = '0x1234567890123456789012345678901234567890123456789012345678901234'
    await identityEvents.methods.emitIdentityUpdated(ipfsHash).send({ from: user })

    // Check an update event was emitted
    const events = await identityEvents.getPastEvents(
      'IdentityUpdated',
      { filter: { account: user } },
    )
    const updateEvent = events[0]
    assert.equal(updateEvent.returnValues.account, user)
    assert.equal(updateEvent.returnValues.ipfsHash, ipfsHash)
  })

  it('identity delete', async function() {
    await identityEvents.methods.emitIdentityDeleted().send({ from: user })

    // Check a delete event was emitted.
    const events = await identityEvents.getPastEvents(
      'IdentityDeleted',
      { filter: { account: user } },
    )
    const deleteEvent = events[0]
    assert.equal(deleteEvent.returnValues.account, user)
  })

})