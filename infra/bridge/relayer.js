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

const verifySign = async ({ to, web3, sign, signer, txData }) => {
  const nonce = 0 // Should get from database

  const signedData = web3.utils.soliditySha3(
    { t: 'address', v: signer }, // Signer
    { t: 'address', v: to }, // Marketplace address
    { t: 'uint256', v: web3.utils.toWei('0', 'ether') }, // value
    { t: 'bytes', v: txData },
    { t: 'uint256', v: nonce } // nonce
  )

  try {
    const msgBuffer = utils.toBuffer(signedData)

    const prefix = Buffer.from('\x19Ethereum Signed Message:\n')
    const prefixedMsg = utils.sha3(
      Buffer.concat([prefix, Buffer.from(String(msgBuffer.length)), msgBuffer])
    )

    const r = utils.toBuffer(sign.slice(0, 66))
    const s = utils.toBuffer('0x' + sign.slice(66, 130))
    const v = utils.bufferToInt(utils.toBuffer('0x' + sign.slice(130, 132)))

    const pub = utils.ecrecover(prefixedMsg, v, r, s)
    const address = '0x' + utils.pubToAddress(pub).toString('hex')

    return address.toLowerCase() === signer.toLowerCase()
  } catch (e) {
    return false
  }
}

const verifyFunctionSignature = async ({ functionSignature, data }) => {
  return data.toLowerCase().startsWith(functionSignature)
}

app.post('/', async function(req, res) {
  const { sign, signer, txData, provider, to } = req.body

  const web3 = new Web3(provider)

  const nodeAccounts = await web3.eth.getAccounts()
  const from = nodeAccounts[0]

  const signValid = await verifySign({ to, web3, sign, signer, txData })

  // 1. Verify sign
  if (!signValid) {
    return res.status(400).send({ errors: ['Cannot verify your signature'] })
  }

  // 2. Verify txData and check function signature
  if (
    !verifyFunctionSignature({ functionSignature: '0xca27eb1c', data: txData })
  ) {
    return res.status(400).send({ errors: ['Invalid function signature'] })
  }

  // 3. Deploy or get user's proxy instance
  // const IdentityProxy = await deployProxy({ web3, forAddress: signer })
  const ProxyContract = new web3.eth.Contract(IdentityProxyContract.abi)
  const IdentityProxy = await ProxyContract.deploy({
    data: IdentityProxyContract.bytecode,
    arguments: [signer]
  }).send({
    from: nodeAccounts[0],
    gas: 4000000
  })

  // 4. Call the forward method
  const txHash = await new Promise((resolve, reject) =>
    IdentityProxy.methods
      .forward(to, sign, signer, txData)
      .send({ from, gas: 4000000 })
      .once('transactionHash', resolve)
      .catch(reject)
  )

  // 5. Increment Nonce in DB
  // TODO

  res.status(200)
  res.send({
    userProxy: IdentityProxy._address,
    txHash
  })
})

app.listen(5100, () => {
  console.log(`Relayer listening on port 5100...`)
})

module.exports = app
