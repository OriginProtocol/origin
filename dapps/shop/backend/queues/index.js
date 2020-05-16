const queues = require('./queues')

/**
 * Attaches all backend queue processing functions to their respective queues.
 */
function runProcessors() {
  require('./makeOfferProcessor').attachToQueue()
}

module.exports = {
  queues,
  runProcessors
}
