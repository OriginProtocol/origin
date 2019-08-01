'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('event', 'prefix', {
      type: Sequelize.STRING
    })
  },

  down: (queryInterface) => {
    return queryInterface.dropColumn('event', 'prefix')
  }
}
