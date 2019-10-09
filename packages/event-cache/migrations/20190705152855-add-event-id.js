'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('event', 'id', {
      type: Sequelize.STRING
    })
  },

  down: (queryInterface) => {
    return queryInterface.dropColumn('event', 'id')
  }
}
