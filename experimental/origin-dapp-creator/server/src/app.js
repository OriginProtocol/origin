require('dotenv').config()
try {
  require('envkey')
} catch(error) {
  console.warn('ENVKEY not configured')
}

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const ipfsApi = require('ipfs-api')
const ReadableStream = require('stream').Readable
const Web3 = require('web3')
const web3 = new Web3()

const app = express()
const port = process.env.PORT || 4321
const ipfsClient = ipfsApi(
  process.env.IPFS_API_HOST || 'localhost',
  process.env.IPFS_API_PORT || 5002,
  {
    protocol: process.env.IPFS_API_PROTOCOL || 'http'
  }
)

import { getDnsRecord, setDnsRecord } from './dns'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.post('/config', async (req, res) => {
  const { config, signature, address } = req.body

  // Validate signature
  const signer = web3.eth.accounts.recover(JSON.stringify(config), signature)
  // Address from recover is checksummed so lower case it
  if (signer.toLowerCase() !== address) {
    res.status(400).send('Invalid signature')
    return
  }

  const existingRecord = await getDnsRecord(config.subdomain, 'TXT')

  if (existingRecord) {
    // Retrieve IPFS content and match addresses of signing wallets
  }

  const stream = new ReadableStream()
  stream.push(JSON.stringify(req.body))
  stream.push(null)

  let response
  try {
    response = await ipfsClient.add(stream)
  } catch(error) {
    console.log(error)
    res.status(500).send('An error occurred saving configuration to IPFS')
    return
  }

  res.send(response)
})

app.post('/config/preview', async (req, res) => {
  const stream = new ReadableStream()
  stream.push(JSON.stringify(req.body))
  stream.push(null)

  let response
  try {
    response = await ipfsClient.add(stream)
  } catch(error) {
    console.log(error)
    res.status(500).send('An error occurred saving configuration to IPFS')
    return
  }
  console.log(response)

  // Remove hash of preview config from pinset because this can be GCed
  ipfsClient.pin.rm(response)

  res.send(response)
})

app.listen(port, () => console.log(`Listening on port ${port}`))
