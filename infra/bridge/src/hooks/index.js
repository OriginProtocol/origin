'use strict'

const { subscribeToHooks: subscribeToTwitterHooks } = require('./twitter')

async function subscribeToHooks() {
  return subscribeToTwitterHooks()
}

module.exports = {
  subscribeToHooks
}
