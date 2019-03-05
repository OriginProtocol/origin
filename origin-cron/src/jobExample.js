const logger = require('./logger')

/**
 * A job for example purposes only.
 * @param job
 * @returns {Promise<*>}
 */
async function ExampleJob(job) {
  logger.info(`Processing ExampleJob id=${job.id} data= ${job.data}`)
  job.progress(0)

  // Wait a bit then complete.
  await new Promise(resolve => setTimeout(resolve, 5000))
  job.progress(100)

  logger.info(`ExampleJob id=${job.id} done`)
  return Promise.resolve({ jobDone: true })
}

module.exports = ExampleJob
