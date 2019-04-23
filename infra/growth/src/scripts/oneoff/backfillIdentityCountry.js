// One-off script to backfill the country column of the identity table.
//
// Note: logically this script belongs more to the identity package
// rather than growth package. But identity does not have all the dependencies
// required (e.g. bridge, growth)... Since this is a one-off script that will
// get deleted after it gets run in production, we made the decision
// to put it in the growth package.

const _identityModels = require('@origin/identity/src/models')
const _bridgeModels = require('@origin/bridge/src/models')
const db = { ..._identityModels, ..._bridgeModels }
const { ip2geo } = require('../../util/ip2geo')
const parseArgv = require('../../util/args')

const Logger = require('logplease')
Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('backfill', { showTimestamp: false })

async function main(dryRun) {
  // Load all identity rows.
  // It's a small amount of rows so ok to load them all up in memory.
  const identities = await db.Identity.findAll()
  logger.info(`Loaded ${identities.length} rows from identity table.`)

  for (const identity of identities) {
    if (!identity.country) {
      // Get the IP from the most recent attestation
      const attestation = await db.Attestation.findOne({
        where: { ethAddress: identity.ethAddress },
        order: [['createdAt', 'DESC']]
      })
      if (!attestation) {
        logger.info(`No attestation data for identity ${identity.ethAddress}`)
        continue
      }
      const ip = attestation.remoteIpAddress

      // Get the country by doing a geo lookup.
      const geo = await ip2geo(ip)
      if (!geo) {
        logger.info(
          `IP lookup failed for identity ${identity.ethAddress} ip=${ip}`
        )
        continue
      }
      const country = geo.countryCode

      if (dryRun) {
        logger.info(
          `Would update identity row with ethAddress ${
            identity.ethAddress
          } country: ${country}`
        )
      } else {
        identity.update({ country })
        logger.info(
          `Updated identity row with ethAddress ${
            identity.ethAddress
          } country: ${country}`
        )
      }
    }
  }
}

const args = parseArgv()
const dryRun = args['--dryRun'] === 'false' ? false : true

logger.info('Starting backfill...')
logger.info('DryRun mode=', dryRun)
main(dryRun).then(() => logger.info('Done'))
