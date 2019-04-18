const assert = require('assert')

const { InMemoryBackend } = require('../src/backends')
const { EventCache, patchWeb3Contract } = require('../src')

const contracts = require('./_contracts')
const ipfs = require('./_ipfs')
const { STD_GAS, STD_GAS_DEPLOY, STD_GAS_PRICE, INT_1E24 } = require('./const')

describe('EventCache', function() {

  let Marketplace,
      OriginToken,
      IdentityEvents

  let owner,
      alice,
      bob,
      charlie,
      denise

  before(async function() {
    const accounts = await contracts.web3.eth.getAccounts()
    owner = accounts[0]
    alice = accounts[1]
    bob = accounts[2]
    charlie = accounts[3]
    denise = accounts[4]

    const deploytx = {
      from: owner,
      gas: STD_GAS_DEPLOY,
      gasPrice: STD_GAS_PRICE
    }

    OriginToken = await contracts.token.deploy({
      arguments: ['OriginToken', 'OGN', 18, INT_1E24]
    }).send(deploytx)

    Marketplace = await contracts.marketplace.deploy({
      arguments: [OriginToken.address]
    }).send(deploytx)

    IdentityEvents = await contracts.identity.deploy().send(deploytx)

  })

  after(async function() {
    console.debug('AFTER')
  })

  it('should initialize the proper backend', async () => {
    // Memory
    const memoryBackend = new InMemoryBackend()
    const eventCacheMemory = new EventCache(IdentityEvents, 0, {
      backend: memoryBackend
    })
    assert(
      eventCacheMemory.backend.type === 'memory',
      `Expected 'memory' backend, got '${eventCacheMemory.backend.type}'`
    )

    /* TODO
    // Node
    const eventCacheNode = new EventCache(IdentityEvents, 0, {
      platform: 'nodejs'
    })
    assert(eventCacheNode.backend.type == 'postgresql')*/

  })

  it('should process events', async () => {

    const tx = {
      from: alice,
      gas: STD_GAS,
      gasPrice: STD_GAS_PRICE
    }

    // Memory
    const memoryBackend = new InMemoryBackend()
    const eventCacheMemory = new EventCache(IdentityEvents, 0, {
      backend: memoryBackend
    })

    let expectedEvents = 0

    // First, lets generate an event
    const testObjectHash = await ipfs.addObject({ one: 1 })
    const receipt = await IdentityEvents.methods.emitIdentityUpdated(testObjectHash).send(tx)
    assert(receipt.status == 1, 'emitIdentityUpdated() transaction failed')
    expectedEvents += 1
    
    const initialEvents = await eventCacheMemory.getPastEvents('IdentityUpdated', {
      filter: { account: alice }
    })

    assert(
      initialEvents.length == expectedEvents,
      `Expected ${expectedEvents} event, got ${initialEvents.length}`
    )
    assert(initialEvents[0].returnValues.account === alice, 'Unexpected account in event')
    assert(initialEvents[0].returnValues.ipfsHash === testObjectHash, 'Unexpected hash in event')

    // Let's do another round
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

    // Let's see what the cache knows about now
    const finalEvents = await eventCacheMemory.getPastEvents('IdentityUpdated')

    assert(
      finalEvents.length == expectedEvents,
      `Expected ${expectedEvents} event, got ${finalEvents.length}`
    )
    assert(finalEvents[0].returnValues.account === alice, 'Unexpected account in #0 event')
    assert(finalEvents[0].returnValues.ipfsHash === testObjectHash, 'Unexpected hash in #0 event')
    assert(finalEvents[1].returnValues.account === alice, 'Unexpected account in #1 event')
    assert(finalEvents[1].returnValues.ipfsHash === secondObjectHash, 'Unexpected hash in #1 event')
    assert(finalEvents[2].returnValues.account === bob, 'Unexpected account in #2 event')
    assert(finalEvents[2].returnValues.ipfsHash === thirdObjectHash, 'Unexpected hash in #2 event')

  })

  it('should patch web3 Contract', async () => {
    const memoryBackend = new InMemoryBackend()

    assert(
      !Marketplace.hasOwnProperty('eventCache'),
      'Marketplace should not have eventsCache prop yet'
    )

    const NewMarketplace = patchWeb3Contract(Marketplace, 0, {
      backend: memoryBackend
    })

    assert(
      Marketplace.hasOwnProperty('eventCache'),
      'Marketplace should have eventsCache prop after patch'
    )

    assert(
      NewMarketplace.hasOwnProperty('eventCache'),
      'NewMarketplace should have eventsCache prop after patch'
    )
  })

  it('should be able to fetch events with array parameters', async () => {
    const indexedBackend = new InMemoryBackend()
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
