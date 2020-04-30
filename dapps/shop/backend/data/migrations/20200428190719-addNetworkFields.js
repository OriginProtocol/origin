'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([
        queryInterface.addColumn('networks', 'active', {
          type: Sequelize.BOOLEAN
        }),
        queryInterface.addColumn('networks', 'config', {
          type: Sequelize.TEXT
        }),
        queryInterface.addColumn('sellers', 'superuser', {
          type: Sequelize.BOOLEAN
        })
      ])
    )
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([
        queryInterface.removeColumn('networks', 'active'),
        queryInterface.removeColumn('networks', 'config'),
        queryInterface.removeColumn('sellers', 'superuser')
      ])
    )
  }
}
