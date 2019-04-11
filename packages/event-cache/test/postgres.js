//import indexedDB from 'fake-indexeddb'
import assert from 'assert'

import { PostgreSQLBackend } from '../src/backends'
import { EventCache } from '../src'

import contracts, { web3 } from './_contracts'
import ipfs from './_ipfs'
import { STD_GAS, STD_GAS_DEPLOY, STD_GAS_PRICE } from './const'

describe('PostgreSQL', function() {
  let IdentityEvents

  let owner,
      alice,
      bob,
      charlie

  let expectedEvents = 0

  before(async function() {
    const accounts = await web3.eth.getAccounts()
    owner = accounts[0]
    alice = accounts[1]
    bob = accounts[2]
    charlie = accounts[3]

    IdentityEvents = await contracts.identity.deploy().send({
      from: owner,
      gas: STD_GAS_DEPLOY,
      gasPrice: STD_GAS_PRICE
    })

  })

  it('should work with PostgreSQL', async () => {
    const postgreBackend = new PostgreSQLBackend()
    const pgCache = new EventCache(IdentityEvents, 0, {
      backend: postgreBackend
    })
    assert(
      pgCache.backend.type === 'postgresql',
      `Expected 'postgresql' backend, got '${pgCache.backend.type}'`
    )
  })

  it('should dump serialized data from PostgreSQL', async () => {
    const postgresBackend = new PostgreSQLBackend()
    const pgCache = new EventCache(IdentityEvents, 0, {
      backend: postgresBackend
    })
    assert(
      pgCache.backend.type === 'postgresql',
      `Expected 'postgresql' backend, got '${pgCache.backend.type}'`
    )

    const tx = {
      gas: STD_GAS,
      gasPrice: STD_GAS_PRICE,
      from: alice
    }

    // Generate an event
    const testObjectHash = await ipfs.addObject({ one: 1 })
    const receipt = await IdentityEvents.methods.emitIdentityUpdated(testObjectHash).send(tx)
    assert(receipt.status == 1, 'emitIdentityUpdated() transaction failed')
    expectedEvents += 1
    
    const initialEvents = await pgCache.getPastEvents('IdentityUpdated', {
      filter: { account: alice }
    })

    assert(
      initialEvents.length == expectedEvents,
      `Expected ${expectedEvents} event, got ${initialEvents.length}`
    )
    assert(initialEvents[0].returnValues.account === alice, 'Unexpected account in event')
    assert(initialEvents[0].returnValues.ipfsHash === testObjectHash, 'Unexpected hash in event')

    const serialized = await postgresBackend.serialize()
    assert(serialized.length > 0)
  })

  it('should be able to fetch events', async () => {
    const postgresBackend = new PostgreSQLBackend()
    const pgCache = new EventCache(IdentityEvents, 0, {
      backend: postgresBackend
    })

    const tx = {
      gas: STD_GAS,
      gasPrice: STD_GAS_PRICE,
      from: charlie
    }

    // First, lets generate an event
    const testObjectHash = await ipfs.addObject({ one: 1 })
    const receipt = await IdentityEvents.methods.emitIdentityUpdated(testObjectHash).send(tx)
    assert(receipt.status == 1, 'emitIdentityUpdated() transaction failed')
    expectedEvents += 1

    // Add more events!
    const secondObjectHash = await ipfs.addObject({ two: 2 })
    const secondReceipt = await IdentityEvents.methods.emitIdentityUpdated(secondObjectHash).send(tx)
    assert(secondReceipt.status == 1, 'emitIdentityUpdated() transaction failed')
    expectedEvents += 1

    const thirdObjectHash = await ipfs.addObject({ two: 2 })
    const thirdReceipt = await IdentityEvents.methods.emitIdentityUpdated(thirdObjectHash).send(
      Object.assign({}, tx, {
        from: bob
      })
    )
    assert(thirdReceipt.status == 1, 'emitIdentityUpdated() transaction failed')
    expectedEvents += 1

    // Now we should see 2 from alice and one from bob
    const charlieEvents = await pgCache.getPastEvents('IdentityUpdated', {
      filter: { account: charlie }
    })

    assert(
      charlieEvents.length == 2,
      `Charlie should have 2 events, got ${charlieEvents.length}`
    )
    const bobEvents = await pgCache.getPastEvents('IdentityUpdated', {
      filter: { account: bob }
    })
    assert(
      bobEvents.length == 1,
      `Bob should have 1 event, got ${bobEvents.length}`
    )
  })
})
