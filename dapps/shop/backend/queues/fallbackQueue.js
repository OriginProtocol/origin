/**
 * A fallback "queue" to use when redis is unavailable. It just runs
 * the queue's processing function immediately when you add a job.
 *
 * Thus, this this isn't actually a queue at all, and contains
 * no retries or error handling. But your job gets run.
 */
class FallbackQueue {
  /**
   * @param {*} name - name of queue
   * @param {object} opts - unused, here for compatibility only
   */
  constructor(name, opts) {
    this.name = name
    this.processor = undefined
    this.opts = opts
  }

  /**
   * Adds a job to the queue. Job will be run immediately, and you
   * can `await` the job's completion if your processing function supports it.
   * @param {*} data
   */
  async add(data) {
    console.log(this.name + ' queue using inline queue processor fallback.')
    if (this.processor == undefined) {
      throw new Error('No processor defined for this fake job queue')
    }
    const job = {
      data: data,
      progress: () => undefined,
      log: console.log
    }
    await this.processor(job)
  }

  /**
   * Registers your job processing function.
   * @param {function} fn - code the runs for each submitted job
   */
  process(fn) {
    this.processor = fn
  }

  /**
   * Do nothing stub
   */
  resume() {}

  /**
   * Do nothing stub
   */
  pause() {}
}

module.exports = FallbackQueue
