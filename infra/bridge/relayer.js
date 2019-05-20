'use strict'

const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const Web3 = require('web3')
const utils = require('ethereumjs-util')
const ProxyFactoryContract = require('@origin/contracts/build/contracts/ProxyFactory_solc')
const IdentityProxyContract = require('@origin/contracts/build/contracts/IdentityProxy_solc')
const MarketplaceContract = require('@origin/contracts/build/contracts/V00_Marketplace')
const IdentityEventsContract = require('@origin/contracts/build/contracts/IdentityEvents')
const config = require('@origin/contracts/build/contracts.json')

app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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

app.post('/', async function(req, res) {
  const { signature, from, txData, provider, to, proxy, preflight } = req.body

  // Pre-flight requests check if the relayer is available and willing to pay
  if (preflight) {
    return res.send({ success: true })
  }

  const web3 = new Web3(provider)
  const ProxyFactory = new web3.eth.Contract(
    ProxyFactoryContract.abi,
    config.ProxyFactory
  )

  const nodeAccounts = await web3.eth.getAccounts()
  const Forwarder = nodeAccounts[0]
  let nonce = 0

  const IdentityProxy = new web3.eth.Contract(IdentityProxyContract.abi, proxy)
  const Marketplace = new web3.eth.Contract(MarketplaceContract.abi)
  const IdentityEvents = new web3.eth.Contract(IdentityEventsContract.abi)
  const methods = {}
  Marketplace._jsonInterface
    .concat(IdentityProxy._jsonInterface)
    .concat(IdentityEvents._jsonInterface)
    .concat(ProxyFactory._jsonInterface)
    .filter(i => i.type === 'function' && !i.constant)
    .forEach(o => (methods[o.signature] = o))

  const method = methods[txData.substr(0, 10)]

  if (proxy) {
    nonce = await IdentityProxy.methods.nonce(from).call()
  }

  const args = { to, from, signature, txData, web3, nonce }
  const sigValid = await verifySig(args)
  if (!sigValid) {
    return res.status(400).send({ errors: ['Cannot verify your signature'] })
  }

  // 2. Verify txData and check function signature
  if (!method) {
    return res.status(400).send({ errors: ['Invalid function signature'] })
  }

  let tx, txHash

  try {
    // If no proxy was specified assume the request is to deploy a proxy...
    if (!proxy) {
      if (to !== ProxyFactory.options.address) {
        throw new Error('Incorrect ProxyFactory address provided')
      } else if (method.name !== 'createProxyWithNonce') {
        throw new Error('Incorrect ProxyFactory method provided')
      }
      const args = { to, data: txData, from: Forwarder }
      const gas = await web3.eth.estimateGas(args)
      tx = web3.eth.sendTransaction({ ...args, gas })
    } else {
      const rawTx = IdentityProxy.methods.forward(to, signature, from, txData)
      const gas = await rawTx.estimateGas({ from: Forwarder })
      // TODO: Not sure why we need extra gas here
      tx = rawTx.send({ from: Forwarder, gas: gas + 100000 })
    }

    txHash = await new Promise((resolve, reject) =>
      tx
        .once('transactionHash', resolve)
        .once('receipt', receipt => {
          const gas = receipt.gasUsed
          const acct = from.substr(0, 10)
          console.log(`Paid ${gas} gas on behalf of ${acct} for ${method.name}`)
        })
        .catch(reject)
    )
  } catch (err) {
    console.log(err)
    return res.status(400).send({ errors: ['Error forwarding'] })
  }

  res.send({ id: txHash })
})

app.listen(5100, () => {
  console.log(`Relayer listening on port 5100...`)
})

module.exports = app
