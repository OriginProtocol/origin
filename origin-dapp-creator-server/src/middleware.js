'use strict'

import { getDnsRecord, parseDnsTxtRecord, subdomainBlacklist } from './lib/dns'
import { getConfigFromIpfs } from './lib/ipfs'
import logger from './logger'

const Web3 = require('web3')
const web3 = new Web3(process.env.PROVIDER_URL)

export async function validateSubdomain(req, res, next) {
  const { address, config } = req.body

  if (config.subdomain) {
    // Check for subdomain blacklisting
    if (subdomainBlacklist.includes(config.subdomain.toLowerCase())) {
      logger.warn(
        `Attempted publication to blacklisted subdomain: ${config.subdomain}`
      )
      return res.status(400).send('Subdomain is not allowed')
    }

    try {
      req.dnsRecord = await getDnsRecord(config.subdomain, 'TXT')
    } catch (error) {
      logger.error(error)
      return res.status(500).send('An error occurred retrieving DNS records')
    }

    if (req.dnsRecord) {
      req.existingConfigIpfsHash = parseDnsTxtRecord(req.dnsRecord.data[0])
      if (!req.existingConfigIpfsHash) {
        logger.warn(
          `Failed to retrieve existing DApp configuration: ${config.subdomain}`
        )
        return res
          .status(500)
          .send('An error occurred retrieving an existing DApp configuration')
      }

      // Fetch the existing configuration for this marketplace to validate the
      // Etheruem address
      req.existingConfig = await getConfigFromIpfs(req.existingConfigIpfsHash)

      if (req.existingConfig) {
        if (req.existingConfig.address !== address) {
          // Attempting to publish a subdomain where the publisher Ethereum
          // address is different from the address of the previous
          // publication
          logger.warn(
            `Publication overwrite address mismatch: ${config.subdomain}`
          )
          return res
            .status(400)
            .send('Subdomain is in use by another Ethereum adddress')
        }
      } else {
        // No config was found, but the config should always be available here
        // because a DNS record exists
        return res
          .send(500)
          .send('An error occurred retrieving configuration from IPFS')
      }
    }
  }

  next()
}

export function validateSignature(req, res, next) {
  const { address, config, signature } = req.body
  if (config.subdomain) {
    // Validate signature matches
    const signer = web3.eth.accounts.recover(JSON.stringify(config), signature)
    // Address from recover is checksummed so lower case it
    if (!signature || signer.toLowerCase() !== address.toLowerCase()) {
      logger.warn(`Invalid signature: ${config.subdomain}`)
      return res.status(400).send('Signature was invalid')
    }
  }
  logger.debug('Validated signature of configuration')
  next()
}
