const MAX_RETRY_WAIT_MS = 2 * 60 * 1000

/**
 * Retries up to maxRetries times.
 * @param {object} opts - Options (maxRetries, verbose)
 * @param {function} fn - Async function to retry.
 * @returns - Return value of 'fn' if it succeeded.
 */
async function withRetries(opts, fn) {
  const maxRetries = opts.maxRetries || 7
  const verbose = opts.verbose || false

  let tryCount = 0
  while (tryCount < maxRetries) {
    try {
      return await fn() // Do our action.
    } catch (e) {
      // Double wait time each failure
      let waitTime = 1000 * 2 ** (tryCount - 1)
      // Randomly jiggle wait time by 20% either way. No thundering herd.
      waitTime = Math.floor(waitTime * (1.2 - Math.random() * 0.4))
      // Max out at two minutes
      waitTime = Math.min(waitTime, MAX_RETRY_WAIT_MS)
      if (verbose) {
        console.log('retryable error:', e.message)
        console.log(`will retry in ${waitTime / 1000} seconds`)
      }
      tryCount += 1
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  throw new Error('number of retries exceeded')
}

module.exports = { withRetries }
