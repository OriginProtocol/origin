//import indexedDB from 'fake-indexeddb'
import assert from 'assert'

import { IndexedDBBackend } from '../src/backends'
import { EventCache } from '../src'

import contracts, { web3 } from './_contracts'
import ipfs from './_ipfs'
import { STD_GAS, STD_GAS_DEPLOY, STD_GAS_PRICE } from './const'

describe('IndexedDB', function() {
  let IdentityEvents

  let owner,
      alice,
      bob,
      charlie,
      denise

  before(async function() {
    const accounts = await web3.eth.getAccounts()
    owner = accounts[0]
    alice = accounts[1]
    bob = accounts[2]
    charlie = accounts[3]
    denise = accounts[4]

    IdentityEvents = await contracts.identity.deploy().send({
      from: owner,
      gas: STD_GAS_DEPLOY,
      gasPrice: STD_GAS_PRICE
    })

  })

  it('should work with IndexedDB', async () => {
    const indexedBackend = new IndexedDBBackend({ testing: true })
    const idxDBCache = new EventCache(IdentityEvents, 0, {
      backend: indexedBackend
    })
    assert(
      idxDBCache.backend.type === 'indexeddb',
      `Expected 'indexeddb' backend, got '${idxDBCache.backend.type}'`
    )
  })

  it('should be able to fetch events', async () => {
    const indexedBackend = new IndexedDBBackend({ testing: true })
    const idxDBCache = new EventCache(IdentityEvents, 0, {
      backend: indexedBackend
    })

    let expectedEvents = 0
    const tx = {
      gas: STD_GAS,
      gasPrice: STD_GAS_PRICE,
      from: alice
    }

    // First, lets generate an event
    const testObjectHash = await ipfs.addObject({ one: 1 })
    const receipt = await IdentityEvents.methods.emitIdentityUpdated(testObjectHash).send(tx)
    assert(receipt.status == 1, 'emitIdentityUpdated() transaction failed')
    expectedEvents += 1
    
    const initialEvents = await idxDBCache.getPastEvents('IdentityUpdated', {
      filter: { account: alice }
    })

    assert(
      initialEvents.length == expectedEvents,
      `Expected ${expectedEvents} event, got ${initialEvents.length}`
    )
    assert(initialEvents[0].returnValues.account === alice, 'Unexpected account in event')
    assert(initialEvents[0].returnValues.ipfsHash === testObjectHash, 'Unexpected hash in event')

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
    const aliceEvents = await idxDBCache.getPastEvents('IdentityUpdated', {
      filter: { account: alice }
    })
    assert(
      aliceEvents.length == 2,
      `Alice should have 2 events, got ${aliceEvents.length}`
    )
    const bobEvents = await idxDBCache.getPastEvents('IdentityUpdated', {
      filter: { account: bob }
    })
    assert(
      bobEvents.length == 1,
      `Bob should have 1 event, got ${bobEvents.length}`
    )
  })

  it('should be able to fetch events with array parameters', async () => {
    const indexedBackend = new IndexedDBBackend({ testing: true })
    const eventCache = new EventCache(IdentityEvents, 0, {
      backend: indexedBackend
    })

    const tx = {
      gas: STD_GAS,
      gasPrice: STD_GAS_PRICE,
      from: charlie
    }

    const firstObjectHash = await ipfs.addObject({ one: 1 })
    const firstReceipt = await IdentityEvents.methods.emitIdentityUpdated(firstObjectHash).send(tx)
    assert(firstReceipt.status == 1, 'emitIdentityUpdated() transaction failed')

    const secondObjectHash = await ipfs.addObject({ two: 2 })
    const secondReceipt = await IdentityEvents.methods.emitIdentityUpdated(secondObjectHash).send(
      Object.assign({}, tx, { from: denise })
    )
    assert(secondReceipt.status == 1, 'emitIdentityUpdated() transaction failed')

    const orEvents = await eventCache.getPastEvents('IdentityUpdated', {
      filter: { account: [charlie, denise] }
    })

    assert(
      orEvents.length == 2,
      `Request should have returned 2 events, got ${orEvents.length}`
    )
    const possibleAccounts = [charlie, denise]
    assert(possibleAccounts.indexOf(orEvents[0].returnValues.account) > -1, 'Unexpected account')
    assert(possibleAccounts.indexOf(orEvents[1].returnValues.account) > -1, 'Unexpected account')
  })
})
