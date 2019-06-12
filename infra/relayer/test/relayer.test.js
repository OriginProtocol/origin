const assert = require('assert')
const BN = require('bn.js')
const Web3 = require('web3')

const ProxyFactoryBuild = require('../../../packages/contracts/build/contracts/ProxyFactory_solc.json')
const IdentityProxyBuild = require('../../../packages/contracts/build/contracts/IdentityProxy_solc.json')
const IdentityEventsBuild = require('../../../packages/contracts/build/contracts/IdentityEvents.json')
const contractsJSON = require('../../../packages/contracts/build/contracts.json')

const Relayer = require('../src/relayer')

const { wait } = require('./utils')

const MNEMONIC_ONE = 'one two three for five six'

const PROXY_FACTORY_ADDRESS = contractsJSON['ProxyFactory']
const IDENTITY_EVENTS_ADDRESS = contractsJSON['IdentityEvents']
const TEST_PROVIDER_URL = 'http://localhost:8545/'
const TEST_NET_ID = 999
const TWO_GWEI = new BN('2000000000', 10)
const JUNK_HASH = '0x16c55d9e9ca5b673cafaa112195a5ad78ceb104e612ff2afbf34c233d6e7482b'

const web3 = new Web3(TEST_PROVIDER_URL)

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
  let netId, ProxyFactory, IdentityEvents, Funder, Rando

  before(async () => {
    netId = await web3.eth.net.getId()
    assert(netId === TEST_NET_ID, 'Not the expected test network!')

    const accounts = await web3.eth.getAccounts()
    Funder = accounts[0]
    Rando = accounts[1]

    ProxyFactory = new web3.eth.Contract(
      ProxyFactoryBuild.abi,
      PROXY_FACTORY_ADDRESS
    )

    IdentityEvents = new web3.eth.Contract(
      IdentityEventsBuild.abi,
      IDENTITY_EVENTS_ADDRESS
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
      .changeOwnerAndExecute(Rando, IdentityEvents.address, '0', txData)
      .encodeABI()

    // The create proxy call
    const createCallTxData = await ProxyFactory.methods.createProxyWithSenderNonce(PROXY_FACTORY_ADDRESS, proxyTxData, Rando, '0').encodeABI()

    const txToSend = {
      from: Rando,
      to: PROXY_FACTORY_ADDRESS,
      txData: createCallTxData,
      nonce: '0'
    }
    const txDatahash = hashTxdata({ ...txToSend })
    const txToSendSignature = await web3.eth.sign(txDatahash, Rando)

    const request = mockRequest({
      body: {
        ...txToSend,
        signature: txToSendSignature,
        txData: createCallTxData,
        proxy: null,
        preflight: false
      }
    })
    const response = mockResponse()

    await relayer.relay(request, response)

    assert(response.statusCode === 200, `response code is ${response.statusCode}`)
    assert(!response.body.errors, 'errors in response')
    assert(response.body.id, 'missing txhash')

    console.log('Proxy creation txHash', response.body.id)

    const proxyReceipt = await web3.eth.getTransactionReceipt(response.body.id)
    assert(proxyReceipt.status)

    /**
     * This tx receipt should have logs with a ProxyCreation event but doesn't.... ganache bug?
     * Unable to expand proxy testing without knowing the address of the proxy...
     */
    console.log('proxyReceipt', proxyReceipt)

    await relayer.purse.teardown(true) // Testing cleanup only
  })
})
