'use strict'
module.exports = {
  up: queryInterface => {
    return queryInterface.addIndex('discovery_access_token', {
      fields: ['nonce', 'eth_address']
    })
  },
  down: () => {}
}
