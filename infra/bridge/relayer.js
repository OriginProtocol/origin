'use strict'

const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const Web3 = require('web3')
const utils = require('ethereumjs-util')
const IdentityProxyContract = require('@origin/contracts/build/contracts/IdentityProxy')

app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const verifySign = async ({ web3, to, from, signature, txData }) => {
  const nonce = 0 // Should get from database

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

app.post('/', async function(req, res) {
  const { signature, from, txData, provider, to, identity } = req.body

  const web3 = new Web3(provider)

  const nodeAccounts = await web3.eth.getAccounts()
  const forwarder = nodeAccounts[0]

  const signValid = await verifySign({ to, from, signature, txData, web3 })

  // 1. Verify sign
  if (!signValid) {
    return res.status(400).send({ errors: ['Cannot verify your signature'] })
  }

  // 2. Verify txData and check function signature
  // if (!txData.toLowerCase().startsWith('0xca27eb1c')) {
  //   return res.status(400).send({ errors: ['Invalid function signature'] })
  // }

  // 3. Deploy or get user's proxy instance
  const IdentityProxy = new web3.eth.Contract(IdentityProxyContract.abi)
  if (identity) {
    IdentityProxy.options.address = identity
  } else {
    const resp = await IdentityProxy.deploy({
      data: IdentityProxyContract.bytecode,
      arguments: [from]
    }).send({
      from: nodeAccounts[0],
      gas: 4000000
    })
    IdentityProxy.options.address = resp._address
  }

  // 4. Call the forward method
  const txHash = await new Promise((resolve, reject) =>
    IdentityProxy.methods
      .forward(to, signature, from, txData)
      .send({ from: forwarder, gas: 4000000 })
      .once('transactionHash', resolve)
      .catch(reject)
  )

  // 5. Increment Nonce in DB
  // TODO

  res.status(200)
  res.send({ userProxy: IdentityProxy._address, id: txHash })
})

app.listen(5100, () => {
  console.log(`Relayer listening on port 5100...`)
})

module.exports = app
