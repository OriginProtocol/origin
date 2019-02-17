require('@babel/polyfill')

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const Raven = require('raven')

const app = express()
const port = process.env.PORT || 4321

import { setAllRecords, updateTxtRecord } from './lib/dns'
import { addConfigToIpfs, ipfsClient } from './lib/ipfs'
import { validateSubdomain, validateSignature } from './middleware'
import logger from './logger'

// Configure Sentry
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Raven.config(process.env.SENTRY_DSN).install()
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

/* Route for handling creation of configurations. Saves the configuration to
 * IPFS and configures a subdomain if necessary. Subdomains are protected via
 * web3 signatures so it isn't possible to overwrite another users subdomain.
 */
app.post('/config', validateSignature)
app.post('/config', validateSubdomain)

app.post('/config', async (req, res) => {
  const { config } = req.body

  // Add the new config to IPFS
  let ipfsHash
  try {
    // TODO: this should also be pinned on IPFS cluster
    ipfsHash = await addConfigToIpfs(req.body)
  } catch (error) {
    logger.error(error)
    return res
      .status(500)
      .send('An error occurred publishing configuration to IPFS')
  }

  logger.debug(`Uploaded configuration to IPFS: ${ipfsHash}`)

  if (config.subdomain) {
    // Configure DNS settings if we are configuring for a subdomain
    try {
      if (req.dnsRecord) {
        // Record exists, must be updating an existing configuration
        await updateTxtRecord(config.subdomain, ipfsHash, req.dnsRecord)
        // Unpin old config
        ipfsClient.pin.rm(req.existingConfigIpfsHash)
      } else {
        // No existing record, must be a fresh configuration
        await setAllRecords(config.subdomain, ipfsHash)
      }
    } catch (error) {
      logger.error(error)
      return res.status(500).send('Failed to configure DNS records')
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
  } catch (error) {
    logger.error(error)
    res.status(500).send('An error occurred saving configuration to IPFS')
    return
  }

  // Remove hash of preview config from pinset because this can be GCed
  ipfsClient.pin.rm(ipfsHash, (err, pinset) => {
    if (err) {
      logger.warn(`Could not unpin old configuration: ${err}`)
    }
  })

  res.send(ipfsHash)
})

app.post('/validate/subdomain', validateSubdomain)
app.post('/validate/subdomain', async (req, res) => {
  res.status(200).send()
})

app.listen(port, () => logger.info(`Listening on port ${port}`))

module.exports = app
