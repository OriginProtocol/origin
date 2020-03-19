'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('shops', 'password', {
      type: Sequelize.STRING
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('shops', 'password')
  }
}
