// One-off script to backfill the columns ip and country of the growth_participant table.

const _growthModels = require('../../models')
const _bridgeModels = require('@origin/bridge/src/models')
const db = { ..._growthModels, ..._bridgeModels }
const { ip2geo } = require('../../util/ip2geo')
const parseArgv = require('../util/args')

const Logger = require('logplease')
Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('backfill', { showTimestamp: false })

async function main(dryRun) {
  // Load growth_participant rows.
  // It's a small amount of rows so ok to load them all up in memory.
  const participants = await db.GrowthParticipant.findAll()
  logger.info(`Loaded ${participants.length} rows from growth_participant`)

  for (const participant of participants) {
    if (!participant.ip) {
      // Get the IP from the most recent attestation
      const attestations = await db.Attestation.findOne({
        where: { ethAddress: participant.ethAddress },
        order: ['createdAt', 'DESC']
      })
      if (!attestations) {
        continue
      }
      const ip = attestations[0].ip

      // Get the country by doing a geo lookup.
      const { countryCode } = await ip2geo(ip)

      if (dryRun) {
        logger.info(
          `Would update growth_participant row with id ${
            participant.id
          } with ip:${ip} country: ${countryCode}`
        )
      } else {
        participant.update({ ip, country: countryCode })
        logger.info(
          `Updated growth_participant row with id ${
            participant.id
          } with ip:${ip} country: ${countryCode}`
        )
      }
    }
  }
}

const args = parseArgv()
const dryRun = args['dryRun'] !== 'false' ? true : false

logger.info('Starting backfill...')
main(dryRun).then(() => logger.info('Done'))
