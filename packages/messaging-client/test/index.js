import assert from 'assert'
import services from './_services'
import { MemoryStorage, MessagingUser } from './_helpers'
global.fetch = require('cross-fetch')
const Web3 = require('web3')

const ecies = require('eth-ecies')
import OriginMessaging from '../src/Messaging'

// When running these tests, to enable messaging debugging,
// run with DEBUG=messaging:

const isWatchMode = process.argv.some(arg => arg === '-w' || arg === '--watch')
let servicesShutdown

// Convenience function
async function sleep(ms) {
  await new Promise(function(resolve) {
    setTimeout.apply(null, [resolve].concat([ms]))
  })
}

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

let alice
let bob
let mallory

// Setup origin services and get account eth eth addresses
before(async function() {
  this.timeout(30000)
  servicesShutdown = await services()
  const accounts = await web3.eth.getAccounts()
  alice = accounts[2]
  bob = accounts[3]
  mallory = accounts[4]
})

describe('Conversation messaging', function() {
  let aliceMessaging
  let bobMessaging
  let testContents = ''

  it('can create a messaging client', async () => {
    aliceMessaging = new OriginMessaging({
      contractService: { web3: web3 },
      ecies,
      messagingNamespace: 'origin:experimental',
      globalKeyServer: 'https://messaging.dev.originprotocol.com',
      personalSign: false
    })
    aliceMessaging.currentStorage = new MemoryStorage()
  })
  it('can init a messaging client', async () => {
    await aliceMessaging.init(alice)
  })
  it('can enable messaging', async () => {
    await aliceMessaging.promptToEnable()
    await sleep(1000)
  })
  it('can load conversations', async () => {
    await aliceMessaging.loadMyConvs()
    await sleep(4000)
  })

  it('can be also be bob', async () => {
    bobMessaging = new OriginMessaging({
      contractService: { web3: web3 },
      ecies,
      messagingNamespace: 'origin:experimental',
      globalKeyServer: 'https://messaging.dev.originprotocol.com',
      personalSign: false
    })
    bobMessaging.currentStorage = new MemoryStorage()
    await bobMessaging.init(bob)
    await bobMessaging.promptToEnable()
    await sleep(1000)
  })

  it('alice can message bob', async () => {
    testContents = 'hi, bob. ' + new Date()
    await aliceMessaging.sendConvMessage(bob, { contents: testContents })
    await bobMessaging.loadMyConvs()
    await sleep(1000)
  })

  it("bob can read alice's message", async () => {
    const roomId = bobMessaging.generateRoomId(bobMessaging.account_key, alice)
    await bobMessaging.getRoom(roomId)
    await sleep(1000)
    const messages = await bobMessaging.getAllMessages(alice)
    const myMessage = messages.find(m => m.msg.contents == testContents)
    assert.ok(myMessage)
  })
})

describe('Out Of Band Messaging', function() {
  let bobUser
  let malloryUser

  before(async function() {
    bobUser = new MessagingUser({ name: 'Bob', address: bob })
    await bobUser.init({ enableMessaging: true })
    malloryUser = new MessagingUser({ name: 'Mallory', address: mallory })
    await malloryUser.init({ enableMessaging: true })
  })

  let bobsMessage
  it('should allow bob to create a message to mallory', async () => {
    const messaging = bobUser.messaging
    bobsMessage = await messaging.createOutOfBandMessage(mallory, 'Hi Mal')
    assert(bobsMessage)
  })
  it('should allow mallory to read the message', async () => {
    const messaging = malloryUser.messaging
    const decrypted = await messaging.decryptOutOfBandMessage(bobsMessage)
    assert(!decrypted.error)
    const text = decrypted.content.content
    assert.equal(text, 'Hi Mal')
  })
  it('should allow bob to read his own message', async () => {
    const messaging = bobUser.messaging
    const decrypted = await messaging.decryptOutOfBandMessage(bobsMessage)
    assert(!decrypted.error)
    const text = decrypted.content.content
    assert.equal(text, 'Hi Mal')
  })
})

if (isWatchMode) {
  process.once('exit', () => process.exit(0))
} else {
  // Shutdown ganache etc if we're not in watch mode and tests are finished.
  after(async function() {
    await servicesShutdown()
  })
}
