'use strict'

const INDEX_NAME = 'event__prefix_idx'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('event', 'prefix', {
      type: Sequelize.STRING
    }).then(() => {
      queryInterface.addIndex('event', {
        fields: ['prefix'],
        name: INDEX_NAME
      })
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeIndex('event', INDEX_NAME).then(() => {
      queryInterface.dropColumn('event', 'prefix')
    })
  }
}
