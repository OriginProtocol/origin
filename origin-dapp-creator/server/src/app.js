const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const Logger = require('logplease')
const Web3 = require('web3')
const web3 = new Web3()

const app = express()
const port = process.env.PORT || 4321
const logger = Logger.create('origin-dapp-creator-server')

import { getDnsRecord, configureRecords } from './dns'
import { addConfigToIpfs, getConfigFromIpfs } from './ipfs'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.post('/config', async (req, res) => {
  const { config, signature, address } = req.body

  // Validate signature matches
  const signer = web3.eth.accounts.recover(JSON.stringify(config), signature)
  // Address from recover is checksummed so lower case it
  if (signer.toLowerCase() !== address) {
    res.status(400).send('Invalid signature')
    return
  }

  // Check if there is an existing configuration published for this subdomain
  let existingRecord
  try {
    existingRecord = await getDnsRecord(config.subdomain, 'TXT')
  } catch (error) {
    logger.error(error)
    res.status(400).send('An error occurred retrieving DNS records')
    return
  }

  if (existingRecord) {
    const ipfsPath = parseDnsTxtRecord(existingRecord.data[0])
    if (existingConfig.address !== address) {
      res.status(400).send('Wallet address mismatch, load configuration to modify')
      return
    }
  }

  // Add the new config to IPFS
  let ipfsHash
  try {
    ipfsHash = await addConfigToIpfs(config)
  } catch (error) {
    logger.error(error)
    res.status(400).send('An error occurred publishing configuration to IPFS')
    return
  }

  try {
    await configureRecords(config.subdomain, ipfsHash)
  } catch(error) {
    logger.error(error)
    res.status(400).send('Failed to configure DNS records')
    return
  }

  res.send(ipfsHash)
})

app.post('/config/preview', async (req, res) => {
  const stream = new ReadableStream()
  stream.push(JSON.stringify(req.body))
  stream.push(null)

  let response
  try {
    response = await ipfsClient.add(stream)
  } catch(error) {
    logger.error(error)
    res.status(500).send('An error occurred saving configuration to IPFS')
    return
  }

  // Remove hash of preview config from pinset because this can be GCed
  ipfsClient.pin.rm(response)

  res.send(response)
})

app.get('/validation/subdomain', async (req, res) => {
})

app.listen(port, () => console.log(`Listening on port ${port}`))
