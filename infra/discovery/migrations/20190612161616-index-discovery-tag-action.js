'use strict'
module.exports = {
  up: (queryInterface) => {
    return queryInterface.addIndex('discovery_tag_action', {
        fields: ['listing_id']
    })
  },
  down: () => {
    
  }
}
