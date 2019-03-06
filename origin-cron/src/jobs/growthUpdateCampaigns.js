const logger = require('../logger')
const UpdateCampaigns = require('origin-growth/src/scripts/updateCampaigns')

async function GrowthUpdateCampaignJob(job) {
  logger.info(
    `Starting job GrowthUpdateCampaignJob id=${job.id} data=${job.data} pid=${
      process.pid
    }`
  )
  job.progress(0)

  const config = {
    // By default run in dry-run mode unless explicitly specified.
    persist: job.data.persist !== undefined ? job.data.persist : false
  }
  logger.info('Config:', config)
  const updater = new UpdateCampaigns(config)

  try {
    await updater.process()
  } catch (err) {
    logger.error('Job failed: ', err)
    return Promise.reject(err)
  }

  const stats = updater.stats
  logger.info('Campaigns update stats:')
  logger.info('  Num processed:            ', stats.numProcessed)
  logger.info('  Num marked as calc. ready:', stats.numStatusReady)
  logger.info('  Num usedCap updated:      ', stats.numUsedCapUpdated)

  logger.info(`Job GrowthUpdateCampaignJob id=${job.id} finished.`)
  job.progress(100)
  return Promise.resolve({ stats })
}

module.exports = GrowthUpdateCampaignJob
