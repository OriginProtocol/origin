const createPayload = require('./createPayload')

module.exports = SubProvider

// this is the base class for a subprovider -- mostly helpers

function SubProvider() {}

SubProvider.prototype.setEngine = function(engine) {
  const self = this
  if (self.engine) return
  self.engine = engine
}

SubProvider.prototype.handleRequest = function() {
  throw new Error('Subproviders should override `handleRequest`.')
}

SubProvider.prototype.emitPayload = function(payload, cb) {
  const self = this
  self.engine.sendAsync(createPayload(payload), cb)
}
