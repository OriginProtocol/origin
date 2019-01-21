'use strict'

import { getDnsRecord, parseDnsTxtRecord, subdomainBlacklist } from './lib/dns'
import { getConfigFromIpfs } from './lib/ipfs'

const Web3 = require('web3')
const web3 = new Web3()

export async function validateSubdomain (req, res, next) {
  const { config, address } = req.body

  if (config.subdomain) {
    // Check for subdomain blacklisting
    if (subdomainBlacklist.includes(config.subdomain)) {
      res.status(400).send('Subdomain is not allowed')
    }

    try {
      req.dnsRecord = await getDnsRecord(config.subdomain, 'TXT')
    } catch (error) {
      logger.error(error)
      res.status(500).send('An error occurred retrieving DNS records')
    }

    if (req.dnsRecord) {
      req.existingConfigIpfsHash = parseDnsTxtRecord(req.dnsRecord.data[0])
      if (!req.existingConfigIpfsHash) {
        res.status(500)
          .send('An error occurred retrieving an existing DApp configuration')
      }

      req.existingConfig = await getConfigFromIpfs(req.existingConfigIpfsHash)

      if (req.existingConfig && req.existingConfig.address !== address) {
        res.status(400)
          .send('Subdomain is in use by another Ethereum adddress')
      }
    }
  }

  next()
}

export function validateSignature (req, res, next) {
  const { config, signature } = req.body
  if (config.subdomain) {
    // Validate signature matches
    const signer = web3.eth.accounts.recover(JSON.stringify(config), signature)
    // Address from recover is checksummed so lower case it
    if (signer.toLowerCase() !== address.toLowerCase()) {
      res.status(400).send('Signature was invalid')
    }
  }
  logger.debug('Validated signature of configuration')
  next()
}
