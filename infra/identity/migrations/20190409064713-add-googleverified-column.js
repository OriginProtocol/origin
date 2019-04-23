'use strict'

const tableName = 'identity'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, 'google_verified', Sequelize.BOOLEAN)
  },
  down: queryInterface => {
    return queryInterface.removeColumn(tableName, 'google_verified')
  }
}
