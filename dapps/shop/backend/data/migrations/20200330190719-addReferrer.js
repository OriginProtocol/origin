'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([
        queryInterface.addColumn('orders', 'referrer', {
          type: Sequelize.STRING
        }),
        queryInterface.addColumn('orders', 'commission_pending', {
          type: Sequelize.INTEGER
        }),
        queryInterface.addColumn('orders', 'commission_paid', {
          type: Sequelize.INTEGER
        })
      ])
    )
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([
        queryInterface.removeColumn('orders', 'referrer'),
        queryInterface.removeColumn('orders', 'commission_pending'),
        queryInterface.removeColumn('orders', 'commission_paid')
      ])
    )
  }
}
