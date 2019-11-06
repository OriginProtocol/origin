'use strict'

const tableName = 't3_lockup'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(tableName, 'data', Sequelize.JSONB)
    ])
  },
  down: queryInterface => {
    return Promise.all([queryInterface.removeColumn(tableName, 'data')])
  }
}
