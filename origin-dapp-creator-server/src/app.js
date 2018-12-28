const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const Logger = require('logplease')
const Web3 = require('web3')
const web3 = new Web3()

const app = express()
const port = process.env.PORT || 4321
const logger = Logger.create('origin-dapp-creator-server')

import { getDnsRecord, parseDnsTxtRecord, setAllRecords, updateTxtRecord } from 'dns'
import { addConfigToIpfs, ipfsClient, getConfigFromIpfs } from 'ipfs'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

/* Route for handling creation of configurations. Saves the configuration to
 * IPFS and configures a subdomain if necessary. Subdomains are protected via
 * web3 signatures so it isn't possible to overwrite another users subdomain.
 */
app.post('/config', async (req, res) => {
  const { config, signature, address } = req.body

  let existingRecord
  let existingConfigIpfsHash

  if (config.subdomain) {
    // Validating signing is only necessary if we are configuring for a subdomain

    // Validate signature matches
    const signer = web3.eth.accounts.recover(JSON.stringify(config), signature)
    // Address from recover is checksummed so lower case it
    if (signer.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).send('Signature was invalid')
    }

    // Check if there is an existing configuration published for this subdomain
    try {
      existingRecord = await getDnsRecord(config.subdomain, 'TXT')
    } catch (error) {
      logger.error(error)
      return res.status(500).send('An error occurred retrieving DNS records')
    }

    if (existingRecord) {
      existingConfigIpfsHash = parseDnsTxtRecord(existingRecord.data[0])
      if (!existingConfigIpfsHash) {
        return res.status(500).send('An error occurred retrieving existing configuration')
      }
      const existingConfig = await getConfigFromIpfs(existingConfigIpfsHash)
      if (existingConfig.address !== address) {
        return res.status(400).send({
          subdomain: 'Subdomain in use by another account'
        })
      }
    }

    logger.debug('Validated signature of configuration')
  }

  // Add the new config to IPFS
  let ipfsHash
  try {
    // TODO: this should also be pinned on IPFS cluster
    ipfsHash = await addConfigToIpfs(req.body)
  } catch (error) {
    logger.error(error)
    return res.status(500).send('An error occurred publishing configuration to IPFS')
  }

  logger.debug(`Uploaded configuration to IPFS: ${ipfsHash}`)

  if (config.subdomain) {
    // Configure DNS settings if we are configuring for a subdomain
    try {
      if (existingRecord) {
        // Record exists, must be updating an existing configuration
        await updateTxtRecord(config.subdomain, ipfsHash, existingRecord)
        // Unpin old config
        ipfsClient.pin.rm(existingConfigIpfsHash)
      } else {
        // No existing record, must be a fresh configuration
        await setAllRecords(config.subdomain, ipfsHash)
      }
    } catch(error) {
      logger.error(error)
      res.status(500).send('Failed to configure DNS records')
    }
  }

  logger.debug('Configured DNS records')

  // Return the IPFS hash of the new configuration in the response
  return res.send(ipfsHash)
})

/* Route for handling previews of configurations. Saves the configuration
 * to IPFS and unpins it so that it can be garbage collected because previews
 * are generally short lived.
 */
app.post('/config/preview', async (req, res) => {
  let ipfsHash
  try {
    ipfsHash = await addConfigToIpfs(req.body)
  } catch(error) {
    logger.error(error)
    res.status(500).send('An error occurred saving configuration to IPFS')
    return
  }

  // Remove hash of preview config from pinset because this can be GCed
  ipfsClient.pin.rm(ipfsHash)

  res.send(ipfsHash)
})

app.listen(port, () => console.log(`Listening on port ${port}`))
