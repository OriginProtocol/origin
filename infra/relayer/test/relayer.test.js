const assert = require('assert')
const BN = require('bn.js')
const Web3 = require('web3')

const ProxyFactoryBuild = require('../../../packages/contracts/build/contracts/ProxyFactory_solc.json')
const IdentityProxyBuild = require('../../../packages/contracts/build/contracts/IdentityProxy_solc.json')
const IdentityEventsBuild = require('../../../packages/contracts/build/contracts/IdentityEvents.json')

const Relayer = require('../src/relayer')

const { wait } = require('./utils')

const MNEMONIC_ONE = 'one two three for five six'

const TEST_PROVIDER_URL = 'http://localhost:8545/'
const TEST_NET_ID = 999
const TWO_GWEI = new BN('2000000000', 10)
const JUNK_HASH = '0x16c55d9e9ca5b673cafaa112195a5ad78ceb104e612ff2afbf34c233d6e7482b'

// IdentityUpdated(address,bytes32)
const EVENT_SIG_IDENTITYUPDATED = '0x8a49a94a170e0377e29de8e4b741993bed3dc902443fdc59d79e455137ecab18'
// ProxyCreation(address)
const EVENT_SIG_PROXYCREATION = '0xa38789425dbeee0239e16ff2d2567e31720127fbc6430758c1a4efc6aef29f80'

const web3 = new Web3(TEST_PROVIDER_URL)

function eventSigInReceipt(receipt, sig) {
  for (const log of receipt.logs) {
    if (log.topics[0] === sig) {
      return true
    }
  }
  return false
}

function mockRequest({ body, headers }) {
  const _headers = headers ? headers : {}
  return {
    headers: _headers,
    header(name) {
      return _headers[name]
    },
    body,
  }
}

function mockResponse() {
  const res = {}

  res.statusCode = 200

  res.status = (code) => {
    res.statusCode = code
    return res
  }

  res.send = (body) => {
    res.body = body
    return res
  }

  return res
}

function hashTxdata({ from, to, txData, nonce }) {
  return web3.utils.soliditySha3(
    { t: 'address', v: from },
    { t: 'address', v: to },
    { t: 'uint256', v: '0' },
    { t: 'bytes', v: txData },
    { t: 'uint256', v: nonce }
  )
}


describe('Relayer', async () => {
  const contractsJSON = require('../../../packages/contracts/build/contracts.json')
  const ProxyFactoryAddress = contractsJSON['ProxyFactory']
  const IdentityEventsAddress = contractsJSON['IdentityEvents']
  const IdentityProxyMaster = contractsJSON['IdentityProxyImplementation']
  let netId, ProxyFactory, IdentityEvents, Funder, Rando

  before(async () => {
    netId = await web3.eth.net.getId()
    assert(netId === TEST_NET_ID, 'Not the expected test network!')

    const accounts = await web3.eth.getAccounts()
    Funder = accounts[0]
    Rando = accounts[1]

    ProxyFactory = new web3.eth.Contract(
      ProxyFactoryBuild.abi,
      ProxyFactoryAddress
    )

    IdentityEvents = new web3.eth.Contract(
      IdentityEventsBuild.abi,
      IdentityEventsAddress
    )

    process.env.FORWARDER_MNEMONIC = MNEMONIC_ONE
  })

  it('creates a proxy', async () => {
    const relayer = new Relayer(netId)
    
    // Init the keys now so we can fund them for the test
    await relayer.purse.init()

    // Fund the master account before Purse can send anything
    const masterAddress = relayer.purse.masterWallet.getChecksumAddressString()
    const masterReceipt = await web3.eth.sendTransaction({
      from: Funder,
      to: masterAddress,
      value: web3.utils.toWei('1', 'ether'),
      gas: 21000,
      gasPrice: TWO_GWEI
    })
    assert(masterReceipt.status, 'funding masterWallet failed')

    await wait(3000) // give it a few seconds to fund the children

    // Give Rando some cash
    const receipt = await web3.eth.sendTransaction({
      from: Funder,
      to: Rando,
      value: web3.utils.toWei('1', 'ether'),
      gas: 21000,
      gasPrice: TWO_GWEI
    })
    assert(receipt.status, 'funding failed')

    // Using IdentityEvents for testing because of its simplicity
    const txData = IdentityEvents.methods.emitIdentityUpdated(JUNK_HASH).encodeABI()

    // The proxied call
    const Proxy = new web3.eth.Contract(IdentityProxyBuild.abi)
    const proxyTxData = await Proxy.methods
      .changeOwnerAndExecute(Rando, IdentityEventsAddress, '0', txData)
      .encodeABI()

    // The create proxy call
    const createCallTxData = await ProxyFactory.methods.createProxyWithSenderNonce(IdentityProxyMaster, proxyTxData, Rando, '0').encodeABI()

    const txToSend = {
      from: Rando,
      to: ProxyFactoryAddress,
      txData: createCallTxData,
      nonce: '0' // TODO: Why does relayer peg this at 0?
    }
    const txDatahash = hashTxdata(txToSend)
    const txToSendSignature = await web3.eth.sign(txDatahash, Rando)

    const request = mockRequest({
      body: {
        ...txToSend,
        signature: txToSendSignature,
        proxy: null,
        preflight: false
      }
    })
    const response = mockResponse()

    await relayer.relay(request, response)

    assert(response.statusCode === 200, `response code is ${response.statusCode}`)
    assert(!response.body.errors, 'errors in response')
    assert(response.body.id, 'missing txhash')

    const proxyReceipt = await web3.eth.getTransactionReceipt(response.body.id)
    assert(proxyReceipt.status)

    // Verify the expected events are in the receipt
    assert(eventSigInReceipt(proxyReceipt, EVENT_SIG_IDENTITYUPDATED), 'missing IdentityUpdated event')
    assert(eventSigInReceipt(proxyReceipt, EVENT_SIG_PROXYCREATION), 'missing ProxyCreation event')

    await relayer.purse.teardown(true) // Testing cleanup only
  })
})
