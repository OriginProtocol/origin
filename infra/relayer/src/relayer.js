'use strict'

const Web3 = require('web3')
const utils = require('ethereumjs-util')
const ProxyFactoryContract = require('@origin/contracts/build/contracts/ProxyFactory_solc')
const IdentityProxyContract = require('@origin/contracts/build/contracts/IdentityProxy_solc')
const MarketplaceContract = require('@origin/contracts/build/contracts/V00_Marketplace')
const IdentityEventsContract = require('@origin/contracts/build/contracts/IdentityEvents')
const config = require('@origin/contracts/build/contracts.json')


const verifySig = async ({ web3, to, from, signature, txData, nonce = 0 }) => {
  const signedData = web3.utils.soliditySha3(
    { t: 'address', v: from },
    { t: 'address', v: to },
    { t: 'uint256', v: web3.utils.toWei('0', 'ether') },
    { t: 'bytes', v: txData },
    { t: 'uint256', v: nonce }
  )

  try {
    const msgBuffer = utils.toBuffer(signedData)

    const prefix = Buffer.from('\x19Ethereum Signed Message:\n')
    const prefixedMsg = utils.keccak256(
      Buffer.concat([prefix, Buffer.from(String(msgBuffer.length)), msgBuffer])
    )

    const r = utils.toBuffer(signature.slice(0, 66))
    const s = utils.toBuffer('0x' + signature.slice(66, 130))
    const v = utils.bufferToInt(
      utils.toBuffer('0x' + signature.slice(130, 132))
    )

    const pub = utils.ecrecover(prefixedMsg, v, r, s)
    const address = '0x' + utils.pubToAddress(pub).toString('hex')

    return address.toLowerCase() === from.toLowerCase()
  } catch (e) {
    console.log('error recovering', e)
    return false
  }
}

/**
 * Processes a relay transaction request.
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const relayTx = async(req, res) => {
  const { signature, from, txData, provider, to, proxy, preflight } = req.body

  // Pre-flight requests check if the relayer is available
  if (preflight) {
    return res.send({ success: true })
  }

  const web3 = new Web3(provider)
  const ProxyFactory = new web3.eth.Contract(
    ProxyFactoryContract.abi,
    config.ProxyFactory
  )
  const IdentityImp = new web3.eth.Contract(
    IdentityProxyContract.abi,
    config.IdentityProxyImplementation
  )

  const nodeAccounts = await web3.eth.getAccounts()
  const forwarder = nodeAccounts[0]
  let nonce = 0

  const IdentityProxy = new web3.eth.Contract(IdentityProxyContract.abi)
  const Marketplace = new web3.eth.Contract(MarketplaceContract.abi)
  const IdentityEvents = new web3.eth.Contract(IdentityEventsContract.abi)
  const methods = {}
  Marketplace._jsonInterface
    .concat(IdentityProxy._jsonInterface)
    .concat(IdentityEvents._jsonInterface)
    .filter(i => i.type === 'function' && !i.constant)
    .forEach(o => (methods[o.signature] = o))

  const method = methods[txData.substr(0, 10)]

  if (proxy) {
    IdentityProxy.options.address = proxy
    nonce = await IdentityProxy.methods.nonce(from).call()
  }

  const signValid = await verifySig({
    to,
    from,
    signature,
    txData,
    web3,
    nonce
  })

  // 1. Verify sign
  if (!signValid) {
    return res.status(400).send({ errors: ['Cannot verify your signature'] })
  }

  // 2. Verify txData and check function signature
  // if (!txData.toLowerCase().startsWith('0xca27eb1c')) {
  //   return res.status(400).send({ errors: ['Invalid function signature'] })
  // }

  // 3. Deploy or get user's proxy instance
  if (!proxy) {
    const changeOwner = await IdentityImp.methods.changeOwner(from).encodeABI()

    const res = await ProxyFactory.methods
      .createProxy(IdentityImp._address, changeOwner)
      .send({
        from: nodeAccounts[0],
        gas: 4000000
      })
      .once('receipt', receipt => {
        console.log(`Deployed identity proxy (${receipt.gasUsed} gas)`)
      })

    IdentityProxy.options.address = res.events.ProxyCreation.returnValues.proxy
  }

  // 4. Call the forward method
  let txHash
  try {
    txHash = await new Promise((resolve, reject) =>
      IdentityProxy.methods
        .forward(to, signature, from, txData)
        .send({ from: forwarder, gas: 4000000 })
        .once('transactionHash', resolve)
        .once('receipt', receipt => {
          const gas = receipt.gasUsed
          const acct = from.substr(0, 10)
          console.log(`Paid ${gas} gas on behalf of ${acct} for ${method.name}`)
        })
        .catch(reject)
    )
  } catch (e) {
    console.log(e)
    return res.status(400).send({ errors: ['Error forwarding'] })
  }

  res.status(200)
  res.send({ id: txHash })
}

module.exports = { relayTx }

