'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Message', 'contentHash', {
      type: Sequelize.STRING(66)
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('Message', 'contentHash')
  }
}
