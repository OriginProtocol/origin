'use strict'

const tableName = 't3_transfer_task'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(tableName, 'created_at', Sequelize.DATE),
      queryInterface.addColumn(tableName, 'updated_at', Sequelize.DATE)
    ])
  },
  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn(tableName, 'created_at'),
      queryInterface.removeColumn(tableName, 'updated_at')
    ])
  }
}
