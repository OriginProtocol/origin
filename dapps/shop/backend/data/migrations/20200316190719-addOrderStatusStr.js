'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('orders', 'status_str', {
      type: Sequelize.STRING
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('orders', 'status_str')
  }
}
