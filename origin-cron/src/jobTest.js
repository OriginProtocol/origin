const logger = require('./logger')

/**
 * A job for testing purposes only.
 * @param job
 * @returns {Promise<*>}
 */
async function TestJob(job) {
  logger.info(`Processing DummyJob id=${job.id} data= ${job.data}`)
  job.progress(0)

  // Wait a 5 sec.
  await new Promise(resolve => setTimeout(resolve, 5000))
  job.progress(50)

  // Wait a bit more then complete.
  await new Promise(resolve => setTimeout(resolve, 5000))
  job.progress(100)

  logger.info(`DummyJob id=${job.id} done`)
  return Promise.resolve({ jobDone: true })
}

module.exports = TestJob
