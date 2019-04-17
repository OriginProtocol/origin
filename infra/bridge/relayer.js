'use strict'

const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const Web3 = require('web3')
const utils = require('ethereumjs-util')
const ProxyFactoryContract = require('@origin/contracts/build/contracts/ProxyFactory')
const IdentityProxyContract = require('@origin/contracts/build/contracts/IdentityProxy')
const MarketplaceContract = require('@origin/contracts/build/contracts/V00_Marketplace')
const IdentityEventsContract = require('@origin/contracts/build/contracts/IdentityEvents')

app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const verifySign = async ({ web3, to, from, signature, txData, nonce = 0 }) => {
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
    const prefixedMsg = utils.sha3(
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
    return false
  }
}

let ProxyFactory, IdentityProxyImp

app.post('/', async function(req, res) {
  const { signature, from, txData, provider, to, identity } = req.body

  const web3 = new Web3(provider)

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

  if (identity) {
    IdentityProxy.options.address = identity
    nonce = await IdentityProxy.methods.nonce(from).call()
  }

  const signValid = await verifySign({
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
  if (!identity) {
    if (!ProxyFactory) {
      ProxyFactory = new web3.eth.Contract(ProxyFactoryContract.abi)
      const fr = await ProxyFactory.deploy({
        data: ProxyFactoryContract.bytecode
      }).send({
        from: nodeAccounts[0],
        gas: 4000000
      })
      ProxyFactory.options.address = fr._address

      IdentityProxyImp = await IdentityProxy.deploy({
        data: IdentityProxyContract.bytecode
      }).send({
        from: nodeAccounts[0],
        gas: 4000000
      })
      console.log('Deployed Proxy Factory')
    }

    const changeOwner = await IdentityProxyImp.methods
      .changeOwner(from)
      .encodeABI()

    const res = await ProxyFactory.methods
      .createProxy(IdentityProxyImp._address, changeOwner)
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
  res.send({ userProxy: IdentityProxy._address, id: txHash })
})

app.listen(5100, () => {
  console.log(`Relayer listening on port 5100...`)
})

module.exports = app
